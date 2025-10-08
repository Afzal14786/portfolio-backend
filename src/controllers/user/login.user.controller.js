import { userModel } from "../../models/user.model.js";
import redis from "../../config/redisClient.js";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token.js";

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
      message: "Invalid credentials.",
      success: false,
    });
  }

  // enforce email verification
  if (!user.isVerified) {
      return res.status(403).json({
          message: "Account not verified. Please check your email for the verification link.",
          success: false,
      });
  }

  // password check
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    return res.status(400).json({
      message: "Invalid credentials.",
      success: false,
    });
  }

  // token generation
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // set refresh token
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    path: "/",
  });

  // respond with success
  return res.status(200).json({
    message: "Logged In Successfully",
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified 
      },
      accessToken,
    },
  });
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (refreshToken) {
    try {
      const redisKey = `revoked:${refreshToken}`;
      await redis.set(
          redisKey, 
          'true', 
          'EX',
          REFRESH_TOKEN_TTL_SECONDS
      );
      
    } catch (err) {
      console.error(`Error blacklisting the token in Redis: ${err.message}`);
      return res.status(500).json({
        message: "Internal server error while logout (Token revocation failed).",
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