import { userModel } from "../../models/user.model.js";
import { sendEmail } from "../../emails/sendEmail.js";
import { generateOtp } from "../../utils/opt.js";
import redis from "../../config/redisClient.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token.js";

const PLATFORM_NAME = "TerminalX";
const LOGO_PATH = '../../assets/code.png';

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields required",
      success: false,
    });
  }

  // retrieve user and password
  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(404).json({
      message: "Invalid credentials or user not found",
      success: false,
    });
  }

  // password check
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    return res.status(400).json({
      message: "Your password is wrong",
      success: false,
    });
  }

  // here the email auth must be there

  const otp = generateOtp(); // generating the OTP
  const redisKey = `login_otp:${email}`;
  await redis.set(redisKey, otp, "EX", 300);

  const subject = "Your Login OTP - TerminalX";
  const htmlBody = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 40px 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;"> 
    <!-- Header -->
  <div style="background: linear-gradient(135deg, #0066ff, #00e0ff); padding: 28px 0; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;">
    <img src="${LOGO_PATH}" alt="${PLATFORM_NAME}" width="70" height="70" style="display: block; margin: 0 auto 10px auto; border-radius: 50%; background: #ffffff22; padding: 8px;">
    <h1 style="color: #4be6f7ff; font-size: 26px; margin: 0; font-weight: 700; letter-spacing: 1px;">
      TerminalX Login Verification
    </h1>
  </div>

    
    <!-- Body -->
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; color: #333333; margin-bottom: 16px;">
        Hello <strong>${user.name || "User"}</strong>,
      </p>

      <p style="font-size: 15px; color: #444444; margin-bottom: 24px;">
        We received a request to log in to your <strong>TerminalX</strong> account. Please use the following One-Time Password (OTP) to verify your login.
      </p>

      <!-- OTP Box -->
      <div style="text-align: center; margin: 30px 0;">
        <div style="
          display: inline-block;
          padding: 20px 40px;
          background: linear-gradient(135deg, #e0f7ff, #f0faff);
          border: 2px dashed #007bff;
          border-radius: 10px;
          font-size: 34px;
          font-weight: 700;
          letter-spacing: 6px;
          color: #007bff;
          user-select: all;
        ">
          ${otp}
        </div>
      </div>

      <p style="font-size: 14px; color: #666666; text-align: center; margin-top: 20px;">
        This OTP will expire in <strong>5 minutes</strong>. Do not share it with anyone.
      </p>

      <p style="font-size: 14px; color: #888888; margin-top: 30px; text-align: center;">
        If you did not attempt to log in, you can safely ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #fafafa; text-align: center; padding: 16px; border-top: 1px solid #eee;">
      <p style="font-size: 13px; color: #777;">
        © ${new Date().getFullYear()} <a href="https://iamafzal.tech" style="color: #007bff; text-decoration: none;">iamafzal.tech</a> — All rights reserved.
      </p>
    </div>

  </div>
</div>
`;

  const emailSent = await sendEmail({
    to: email,
    subject,
    html: htmlBody,
    text: `Your OTP is ${otp}. It expires in 5 minute.`,
  });

  if (!emailSent) {
    return res.status(500).json({
      message: "Failed to send OTP, please try again",
      success: false,
    });
  }

  return res.status(200).json({
    message: "OTP sent to your email. Please verify to continue.",
    success: true,
  });
};

export const verifyLogin = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      message: "email & otp is required",
      success: false,
    });
  }

  const redisKey = `login_otp:${email}`;
  const storedOtp = await redis.get(redisKey);

  if (!storedOtp) {
    return res.status(400).json({
      message: "OTP expired or not found. Please login again.",
      success: false,
    });
  }

  if (storedOtp !== otp) {
    return res.status(400).json({
      message: "Invalid OTP. Please try again.",
      success: false,
    });
  }

  await redis.del(redisKey);

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    path: "/",
  });

  return res.status(200).json({
    message: "Login verified successfully",
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
      accessToken,
    },
  });
};

/**
 * Logout user and revoke refresh token
 */
export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    try {
      const redisKey = `revoked:${refreshToken}`;
      await redis.set(redisKey, "true", "EX", REFRESH_TOKEN_TTL_SECONDS);
    } catch (err) {
      console.error(`Error blacklisting the token in Redis: ${err.message}`);
      return res.status(500).json({
        message:
          "Internal server error while logout (Token revocation failed).",
        success: false,
      });
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  return res.status(200).json({
    message:
      "Logged Out Successfully. Refresh Token revoked and cookie cleared.",
    success: true,
  });
};
