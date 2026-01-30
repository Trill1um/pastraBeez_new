import dotenv from "dotenv";
import { client } from "../lib/redis.js";
import { tempUser } from "../models/User.js";
import crypto from "crypto";
dotenv.config();

const codeGeneration = () => {
  const digits = 6;
  const max = 10 ** digits;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(digits, "0");
};

export const sendVerificationEmail = async (userEmail) => {
  let user = null;
  const key = `verify_cooldown:${userEmail}`;
  
  try {
    // console.log("Sending verification email to:", userEmail, "from:", sender);
    
    // Check rate limiting first
    const inCooldown = await client.exists(key);
    if (inCooldown) {
      throw new Error("Please wait before requesting another verification email.");
    }

    // Get the temp user document which should contain the verification code
    user = await tempUser.findOne({ email: userEmail });
    if (!user) {
      throw new Error("Verification period expired for this email, please sign up again.");
    }
    // console.log("Found temp user for verification:", user);
    const code = codeGeneration();
    user.code = code;
    
    await user.save();

    const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "htmlContent": `
          <div style="font-family: Arial, sans-serif; color: #222; padding: 24px;">
            <h2 style="color: #333;">Your PastraBeez verification code</h2>
            <p style="font-size:16px; color:#555;">Use the code below to verify your email address. It will expire in 20 minutes.</p>
            <div style="margin:24px 0; display:flex; align-items:center; justify-content:center;">
              <div style="font-size:28px; letter-spacing:6px; font-weight:700; background:#f7f2e6; padding:16px 28px; border-radius:8px; border:1px solid #f0d9a6;">${code}</div>
            </div>
            <p style="color:#888; font-size:12px;">If you did not request this code, please ignore this email.</p>
          </div>
        `,
        "sender": {
          "email": process.env.EMAIL_USER || "noreply@pastrabeez.com",
          "name": "PastraBeez"
        },
        "subject": "Your PastraBeez verification code",
        "to": [
          {
            "email": userEmail,
            "name": "User"
          }
        ]
      }),
    });

    if (!emailResponse?.ok) {
      const errorData = await emailResponse.json().catch(() => ({}));
      throw new Error(errorData.message || `Email API error: ${emailResponse.status}`);
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent with messageId:', emailResult.messageId);

    // Set cooldown after successful send using setex for better performance
    await client.setex(key, 60 * 2, '1');
    
    console.log(`Verification email sent successfully to ${userEmail}`);
    return { success: true, message: "Verification email sent successfully" };
  } catch (error) {
    console.error("Error in sendVerificationEmail:", error.message);

    // Clean up Redis keys on failure
    try {
      await client.del(key);
      await client.del(`verifying:${userEmail}`);
    } catch (redisError) {
      console.error("Error cleaning up Redis keys:", redisError.message);
    }

    // Return structured error instead of throwing to prevent memory leaks
    return { 
      success: false, 
      message: error.message || "Failed to send verification email",
      error: error.message 
    };
  }
};

export const verifyCode = async (code, userEmail) => {
  let user = null;
  
  try {
    // Input validation
    if (!code || !userEmail) {
      return { success: false, message: "Code and email are required" };
    }
    console.log(`Verifying code for ${userEmail}: ${code}`);

    // Normalize inputs
    const normalizedCode = String(code).trim();
    const normalizedEmail = String(userEmail).toLowerCase().trim();

    // Lookup the pending temp user by email
    user = await tempUser.findOne({ email: normalizedEmail });
    if (!user) {
      return { success: false, message: "Verification session not found or expired" };
    }
    console.log("Found temp user for code verification:", user);

    // Validate code format and compare
    const storedCode = String(user.code || '');
    const matches = storedCode.length === 6 && storedCode === normalizedCode;
    
    if (!matches) {
      return { success: false, message: "Invalid verification code" };
    }

    // Clean up Redis keys
    try {
      await client.del(`verify_cooldown:${normalizedEmail}`);
      await client.del(`verifying:${normalizedEmail}`);
    } catch (redisError) {
      console.error("Error cleaning up Redis keys after verification:", redisError.message);
    }

    return { success: true, message: "Email verified successfully" };

  } catch (error) {
    console.error("Error verifying email code:", error.message);
    
    // Clean up on error
    if (user) {
      try {
        await tempUser.deleteOne({ _id: user._id });
      } catch (cleanupError) {
        console.error("Error cleaning up temp user:", cleanupError.message);
      }
    }

    return { success: false, message: "Verification failed due to server error" };
  }
};