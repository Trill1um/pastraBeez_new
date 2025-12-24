import { client } from "../lib/redis.js";
import { User, tempUser } from "../models/User.js";
import Product from "../models/Products.js";
import P_S from "../models/P_S.js";
import jwt from "jsonwebtoken";
import {
  sendVerificationEmail,
  verifyCode,
} from "../services/verifyEmail.js";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

//Config: Production = secure-true, sameSite-none; Development = secure-false, sameSite-Strict
const cookieConfiguration = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "None" : "Strict",
  maxAge: 3600000,
  partitioned: true,
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

export const login = async (req, res) => {
  try {
    console.log("isProduction: ", isProduction);
    // console.log("Login route activated: ", req.body);
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
    const user = await User.findOne({ email });
    const isValidPassword = await user?.comparePassword(password);
    if (!user || !isValidPassword) {
      // console.log("Invalid login attempt for email:", email, isValidPassword);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate tokens
    const accessToken = genSetAccessToken(res, user._id);
    const refreshToken = genSetRefreshToken(res, user._id);

    // Store refresh token
    await storeRefreshToken(user._id, refreshToken);

    // Clean up temp and cooldown tokens
    await client.del(`verify_cooldown:${email}`);

    // console.log("User authenticated successfully:", user);
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
  console.log("Signup route activated");
  console.log("Signup route activated");
  console.log("Signup route activated");
  console.log("Signup route activated");
  console.log("Signup route activated");
  const { colonyName, email, password, facebookLink, confirmPassword, role } =
    req.body;
  try {
    console.log("ChecK: ", req.body)
    // Validate input
    if (!email || !password) {
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
    let location=facebookLink;
    if (role==="seller") {
      if (!colonyName) {
        return res.status(400).json({ message: "Colony name is required for sellers" });
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
      console.log("Original Facebook link: ", location);
      if (location.includes("/share/")) {
        const resp = await fetch(location, { redirect: "manual" });
        if (resp.status >= 300 && resp.status < 400) {
          location = resp.headers.get("location");
          // console.log("Redirected to: ", location);
        }
      }

      location = (() => {
          const start = location.indexOf("www.facebook.com/") + 17;
          const endQ = location.indexOf("?", start);
          if (endQ===-1) {
            return location.slice(start);
          }
          let base = location.slice(start, endQ);
          const query = location.slice(endQ + 1);
          const params = new URLSearchParams(query);
          const id = params.get("id");
          if (id) {
            base += `?id=${id}`;
          }
          return base;
      })();

      console.log("Final Facebook link after redirects: ", location);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Check if there's a pending verification
    const pendingVerification = await tempUser.findOne({ email });
    if (pendingVerification) {
      return res.status(409).json({ message: "Pending verification already exists for this email" });
    }

    let user;

    if (role==="seller") {
      user = {
        colonyName,
        email,
        password,
        role,
        facebookLink: location,
      };
    } else {
      user = {
        email,
        password,
        role,
      }
    }
    // Create temp user data
    try {
      await tempUser.create(user);
    } catch (error) {
      console.error("Error creating temp user:", error);
      throw error;
    }

    await client.set(`verifying:${user.email}`, "true", "EX", 60 * 20); // 20 minutes
    console.log("Finished creating temp user, proceed to send verification email");
    res.status(201).json({ message: "User created, please verify your email" });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({error: error ,message: "Internal server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      // Remove refresh token from Redis
      await client.del(`refreshToken:${decoded.userId}`);
    }
        
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
    }
    await Product.deleteMany({ userId: userId });
    await P_S.deleteMany({ userId: userId });

    res.clearCookie("accessToken", cookieConfiguration);
    res.clearCookie("refreshToken", cookieConfiguration);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Internal server error" });
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
    res.clearCookie("accessToken",cookieConfiguration);
    res.clearCookie("refreshToken",cookieConfiguration);
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyReceive = async (req, res) => {
  try {
    const { code, email } = req.body;
    if (!code || !email) {
      return res.status(400).json({ message: "Code and email are required" });
    }

    // Verify token
    const isValid = await verifyCode(code, email);

    if (!isValid?.success) {
      return res
        .status(410)
        .json({ message: isValid.message || "Invalid or expired Verification URL" });
    }

    // Check if user already exists
    const check = await User.findOne({ email });
    if (check) {
      return res.status(404).json({ message: "User already exists found" });
    }

    // Check for Pending Verification
    const temp = await tempUser.findOne({ email });
    if (!temp) {
      return res.status(404).json({ message: "No pending verification found for this email." });
    }

    // Create Verified User
    const user = await User.create({
      colonyName: temp.colonyName,
      email: temp.email,
      password: temp.password,
      role: temp.role,
      facebookLink: temp.facebookLink,
    });

    //Delete Temp User and verifying flag
    await tempUser.deleteOne({ email });
    await client.del(`verifying:${email}`);
    await client.del(`verify_cooldown:${email}`);

    // Generate tokens~
    const accessToken = genSetAccessToken(res, user._id);
    const refreshToken = genSetRefreshToken(res, user._id);

    // Store refresh token
    await storeRefreshToken(user._id, refreshToken);

    // Clean up temp and cooldown tokens

    // console.log("Finish verifying successful");
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
    const response = await sendVerificationEmail(userEmail);
    if (!response.success) {
      console.error("Error sending verification email:", response.error);
      return res.status(400).json({ message: response.message || "Failed to send verification email" });
    }
    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error?.message || "Internal server error" });
  }
};

export const cancelVerification = async (req, res) => {
  try {
    // console.log("Cancelation started")
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Delete redis keys related to verification
    await client.del(`verifying:${email}`);
    await client.del(`verify_cooldown:${email}`);

    // Remove temp user document
    await tempUser.deleteOne({ email });

    return res.status(200).json({ message: "Verification cancelled" });
  } catch (error) {
    console.error("Error cancelling verification:", error);
    return res.status(500).json({ message: "Internal server error" });
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
      res.clearCookie("accessToken", cookieConfiguration);
      res.clearCookie("refreshToken", cookieConfiguration);
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
    // console.log("getProfile route activated");
    res.json(req.user);
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
