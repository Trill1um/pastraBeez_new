import { client } from "../lib/redis.js";
import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import {
  sendVerificationEmail,
  verifyEmailToken,
} from "../services/verifyEmail.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import fetch from "node-fetch";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

//Config: Production = secure-true, sameSite-none; Development = secure-false, sameSite-Strict
const cookieConfiguration = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "None" : "Strict",
};

const genSetAccessToken = (res, userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  res.cookie("accessToken", accessToken, {
    ...cookieConfiguration,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  return accessToken;
};

const genSetRefreshToken = (res, userId) => {
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieConfiguration,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return refreshToken;
};

const storeRefreshToken = async (userId, refreshToken) => {
  try {
    await client.set(
      `refreshToken:${userId}`,
      refreshToken,
      "EX",
      60 * 60 * 24 * 7
    ); // 7 days
  } catch (error) {
    console.error("Error storing refresh token:", error);
  }
};

// For Debugging
export const setVerifiedtoFalse = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = await Seller.findOneAndUpdate(
      { email },
      { isVerified: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User set to unverified" });
  } catch (error) {
    console.error("Error setting user to unverified:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    console.log("Login route activated: ", req.body);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check credentials
    const user = await Seller.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      console.log("Invalid login attempt for email:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // // Check if user is already logged in case of multiple login attempts from different tabs and users
    // const existingAccessToken = req.cookies?.accessToken;
    // if (existingAccessToken) {
    //   try {
    //     jwt.verify(existingAccessToken, process.env.ACCESS_TOKEN_SECRET);
    //     return res.status(200).json({
    //       user,
    //       message: "Already logged in",
    //     });
    //   } catch (err) {
    //     // Token is invalid or expired, proceed to generate new tokens
    //     console.error("Existing access token invalid or expired:", err);
    //     return res
    //       .status(401)
    //       .json({ message: "Session expired, please log in again" });
    //   }
    // }

    // Generate tokens
    const accessToken = genSetAccessToken(res, user._id);
    const refreshToken = genSetRefreshToken(res, user._id);

    // Store refresh token
    await storeRefreshToken(user._id, refreshToken);

    // Clean up temp and cooldown tokens
    await client.del(`temp:${email}`);
    await client.del(`verify_cooldown:${email}`);

    console.log("User authenticated successfully:", user);
    return res.status(200).json({
      user,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const signup = async (req, res) => {
  const { colonyName, email, password, facebookLink, confirmPassword } =
    req.body;
  try {
    // Validate input
    if (!colonyName || !email || !password) {
      return res.status(400).json({ message: "Missing credentials detected" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    if (!facebookLink || facebookLink.trim() === "") {
      return res.status(400).json({
        message:
          "Facebook link is required - buyers need a way to contact you!",
      });
    }
    if (!facebookLink.includes("www.facebook.com/")) {
      return res.status(400).json({
        message: "Please enter a valid Facebook link (www.facebook.com/your.username)",
      });
    }

    // get final redirected facebook link if it's a /share/ link
    let location = facebookLink
    console.log("Original Facebook link: ", location);
    if (location.includes("/share/")) {
      const resp = await fetch(location, { redirect: "manual" });
      if (resp.status >= 300 && resp.status < 400) {
        location = resp.headers.get("location");
        console.log("Redirected to: ", location);
      }
    }
    console.log("Final Facebook link after redirects: ", location);
    
    // Check if user already exists
    const existingUser = await Seller.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Check for pending verification
    const existingTemp = await client.get(`temp:${email}`);
    if (existingTemp) {
      return res.status(409).json({
        message:
          "Check your email, Verification for this email is still pending",
      });
    }

    // Create temp user data
    const salt = await bcrypt.genSalt(10);
    const userData = {
      colonyName,
      email,
      facebookLink: (() => {
        const start = location.indexOf("www.facebook.com/") + 17;
        const endQ = location.indexOf("?", start);
        return endQ === -1
          ? location.slice(start)
          : location.slice(start, endQ);
      })(),
      id: "attempt-" + Date.now().toString(),
    };
    userData.password = await bcrypt.hash(password, salt);

    // Store temp user and verifying user tokens in redis
    await client.set(
      `temp:${userData.email}`,
      JSON.stringify(userData),
      "EX",
      60 * 60
    ); // 1 hr
    await client.set(`verifying:${userData.email}`, "true", "EX", 60 * 60); // 1 hr

    // Debug
    const checkToken = await client.get(`temp:${userData.email}`);
    res
      .status(201)
      .json({ token: checkToken, message: "Email Verification Triggered" });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // Remove refresh token from Redis
      await client.del(`refreshToken:${decoded.userId}`);
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const polling = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const verifying = await client.get(`verifying:${email}`);
    let credentials;
    if (verifying) {
      return res.status(200).json({ verified: false, message: "Email not verified yet" });
    } else {
      credentials = await client.get(`temp:${email}`);
      if (!credentials) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({ verified: true, credentials: JSON.parse(credentials), message: "Email verified successfully" });
    }
  } catch (error) {
    console.error("Error in polling:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const verifyReceive = async (req, res) => {
  try {
    const { token, email } = req.body;
    if (!token || !email) {
      return res.status(400).json({ message: "Token and email are required" });
    }

    // Verify token
    const isValid = verifyEmailToken(token, email);
    if (!isValid) {
      return res
        .status(410)
        .json({ message: "Invalid or expired Verification URL" });
    }
    const data = await client.get(`temp:${email}`);
    const userData = data ? JSON.parse(data) : null;

    if (!userData) {
      return res.status(400).json({ message: "Trouble confirming Email" });
    }

    // Check if user already exists
    const existingUser = await Seller.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create new user
    const user = await Seller.create({
      colonyName: userData.colonyName,
      email: userData.email,
      password: userData.password,
      facebookLink: userData.facebookLink,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = await client.del(`verifying:${email}`);
    if (!result) console.log("Finish verifying successful");
    return res.status(200).json({ message: "Email verification successful" });
  } catch (error) {
    return res.status(500).json({ message: error.response?.data.message || "Internal server error" });
  }
};

export const verifySend = async (req, res) => {
  try {
    const { userEmail } = req.body;
    if (!userEmail) {
      return res.status(400).json({ message: "Email is required" });
    }
    const user = JSON.parse(await client.get(`temp:${userEmail}`));
    if (!user.email) {
      return res.status(400).json({ message: "Trouble confirming Email" });
    }
    await sendVerificationEmail(user.email);
    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return res
      .status(500)
      .json({ message: error?.message || "Internal server error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const userId = decoded.userId;

    // Check if the refresh token exists in Redis
    const storedToken = await client.get(`refreshToken:${userId}`);
    if (storedToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Generate new access token only
    genSetAccessToken(res, userId);

    res.status(200).json({ message: "Tokens refreshed successfully" });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    console.log("getProfile route activated");
    res.json(req.user);
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
