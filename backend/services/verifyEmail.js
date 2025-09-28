import mailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { client } from "../lib/redis.js";

dotenv.config();

function setTransporter(user, pass) {
  const transporter = mailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: user,
      pass: pass,
    },
  });
  return transporter;
}

export const sendVerificationEmail = async (userEmail, user=process.env.EMAIL_USER, pass=process.env.EMAIL_PASS) => {
  try {
    console.log("Sending verification email to:", userEmail);
    const key = `verify_cooldown:${userEmail}`;
    const inCooldown = await client.exists(key);
    if (inCooldown) {
      throw new Error("Please wait before requesting another verification email.");
    }
    
    const token = jwt.sign(
      { data: userEmail,},
      process.env.EMAIL_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const verificationLink = `http://localhost:5173/verify?token=${token}&email=${userEmail}`;
    const mailOptions = {
      from: `"PastraBeez" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Verify Your Email for PastraBeez",
      html: `
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
      `,
    };
    const transporter = setTransporter(user, pass);
    await transporter.sendMail(mailOptions);
    await client.set(key, '1', 'EX', 60);
    console.log(`Verification email sent to ${userEmail}`);
  } catch (error) {
    //try to use backup if primary fails
    if (user === process.env.EMAIL_USER) {
      console.error("Error sending verification email:", error);
      await sendVerificationEmail(userEmail, process.env.EMAIL_USER_BACKUP, process.env.EMAIL_PASS_BACKUP);
    } else {
      console.error("Error sending backup verification email:", error);
      throw new Error("Could not send verification email");
    }
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