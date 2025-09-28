import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { client } from "../lib/redis.js";

import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SEND_API);

dotenv.config();

export const sendVerificationEmail = async (userEmail) => {
  try {
    console.log("Sending verification email to:", userEmail);
    const key = `verify_cooldown:${userEmail}`;
    const inCooldown = await client.exists(key);
    if (inCooldown) {
      throw new Error("Please wait before requesting another verification email.");
    }

    const token = jwt.sign(
      { data: userEmail },
      process.env.EMAIL_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const link = process.env.VITE_SERVER_PRODUCTION_URL || process.env.VITE_SERVER_DEVELOPMENT_URL;
    const verificationLink = `${link}/verify?token=${token}&email=${userEmail}`;
    const html = `
      <h1>Email Verification</h1>
      <p>Click the button below to verify your email address:</p>
      <a href="${verificationLink}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #f7b81a;
        color: #fff;
        font-size: 16px;
        font-weight: bold;
        text-decoration: none;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        cursor: pointer;
        margin: 16px 0;
      ">
        Verify Email
      </a>
      <p style="color: #888; font-size: 14px;">This link will expire in 1 hour.</p>
    `;
    const msg = {
      to: userEmail,
      from: process.env.EMAIL_USER,
      subject: "Verify Your Email for PastraBeez",
      text: `Click the link to verify your email: ${verificationLink}`,
      html,
    };
    await sgMail.send(msg);
    await client.set(key, '1', 'EX', 60);
    console.log(`Verification email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending verification email via SendGrid, Deleting redis keys:", error);
    await client.del(`verify_cooldown:${userEmail}`);
    await client.del(`verifying:${userEmail}`);
    await client.del(`temp:${userEmail}`);
    throw new Error("Could not send verification email");
  }
};

export const verifyEmailToken = (token, userEmail) => {
  try {
    const decoded = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);
    console.log("Compare: ", decoded.data, " with ", userEmail);
    return decoded.data === userEmail;
  } catch (error) {
    console.error("Invalid or expired email verification token: ", error);
    return false;
  }
};