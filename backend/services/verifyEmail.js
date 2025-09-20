import mailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const transporter = mailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "menardtroyf@gmail.com",
    pass: "ywtc uval aevu onhn",
  },
});

const EMAIL_TOKEN_SECRET = "secretTest";
const EMAIL_USER = "admmin";

export const sendVerificationEmail = async (userEmail) => {
  try {
    const token = jwt.sign(
      {
        data: userEmail,
      },
      EMAIL_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const verificationLink = `http://localhost:5173/verify?token=${token}&email=${userEmail}`;
    const mailOptions = {
      from: `"PastraBeez" <${EMAIL_USER}>`,
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
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Could not send verification email");
  }
};

export const verifyEmailToken = (token, userEmail) => {
  try {
    const decoded = jwt.verify(token, EMAIL_TOKEN_SECRET);
    console.log("Compare: ", decoded.data, " with ", userEmail);
    return decoded.data === userEmail;
  } catch (error) {
    console.error("Invalid or expired email verification token:");
    return false;
  }
};
