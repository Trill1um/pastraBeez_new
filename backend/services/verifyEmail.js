import dotenv from "dotenv";
import { client } from "../lib/redis.js";
import sgMail from "@sendgrid/mail";
import { tempUser } from "../models/User.js";
import crypto from "crypto";
dotenv.config();

const codeGeneration = () => {
  const digits = 6;
  const max = 10 ** digits;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(digits, "0");
};

export const sendVerificationEmail = async (userEmail, sender = process.env.EMAIL_USER, api_key=process.env.SEND_API) => {
  try {
    sgMail.setApiKey(api_key);
    // console.log("Sending verification email to:", userEmail, "from:", sender);
    const key = `verify_cooldown:${userEmail}`;
    const inCooldown = await client.exists(key);
    if (inCooldown) {
      throw new Error("Please wait before requesting another verification email.");
    }

    // Get the temp user document which should contain the verification code
    const user = await tempUser.findOne({ email: userEmail });
    if (!user) {
      throw new Error("Verification period expired for this email, please sign up again.");
    }
    // console.log("Found temp user for verification:", user);
    const code = codeGeneration();
    user.code = code;
    try {
      await user.save();
      
    } catch (error) {
      console.error("Error saving verification code to temp user:", error);
      throw error;
    }
    const html = `
      <div style="font-family: Arial, sans-serif; color: #222; padding: 24px;">
        <h2 style="color: #333;">Your PastraBeez verification code</h2>
        <p style="font-size:16px; color:#555;">Use the code below to verify your email address. It will expire in 20 minutes.</p>
        <div style="margin:24px 0; display:flex; align-items:center; justify-content:center;">
          <div style="font-size:28px; letter-spacing:6px; font-weight:700; background:#f7f2e6; padding:16px 28px; border-radius:8px; border:1px solid #f0d9a6;">${code}</div>
        </div>
        <p style="color:#888; font-size:12px;">If you did not request this code, please ignore this email.</p>
      </div>
    `;

    const msg = {
      to: userEmail,
      from: sender,
      subject: "Your PastraBeez verification code",
      text: `Your verification code is: ${code}`,
      html,
    };
    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error("Error sending email via SendGrid:", error);
      throw error;
    }
    await client.set(key, '1', 'EX', 60 * 2);
    // console.log(`Verification email sent to ${userEmail} from ${sender}`);
  } catch (error) {
    if (api_key === process.env.SEND_API) {
      // Try backup sender
      return await sendVerificationEmail(userEmail, process.env.EMAIL_USER_BACKUP, process.env.SEND_API_BACKUP);
    } else { 
      console.error("Error sending verification email via SendGrid with backup sender, Deleting redis keys:", error);
      await client.del(`verify_cooldown:${userEmail}`);
      await client.del(`verifying:${userEmail}`);
      throw new Error(error);
    }
  }
};

export const verifyCode = async (code, userEmail) => {
  try {
    // Lookup the pending temp user by email
    const user = await tempUser.findOne({ email: userEmail });
    if (!user) {
      return false;
    }

    // Compare provided code with stored code
    const matches = (String(user.code).length===6)?String(user.code) === String(code): false;
    if (!matches) {
      return false;
    }

    await tempUser.deleteOne({ _id: user._id });
    return true;
  } catch (error) {
    console.error("Error verifying email code:", error);
    return false;
  }
};