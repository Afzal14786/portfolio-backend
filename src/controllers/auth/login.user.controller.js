import redis from "../../config/redisClient.js";
import { loginUser, getUserByEmail } from "../../services/auth/auth.service.js";
import { generateOTP, OTP_TYPES, verifyOTP, invalidateOTP } from "../../services/otp.service.js";
import { sendOTPEmail, sendLoginSuccessEmail } from "../../services/email/email.service.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    // auth service to validate credentials
    const user = await loginUser(email, password);
    
    // Generate login OTP
    const otpResult = await generateOTP(
      email, 
      OTP_TYPES.LOGIN, 
      { userId: user._id.toString() }
    );
    
    // Send OTP email using the unified email service with template type
    const emailSent = await sendOTPEmail(
      email, 
      otpResult.otp, 
      'login',
      user.name
    );

    if (!emailSent) {
      await invalidateOTP(email, OTP_TYPES.LOGIN);
      return res.status(500).json({
        message: "Failed to send OTP, please try again",
        success: false,
      });
    }

    return res.status(200).json({
      message: "OTP sent to your email. Please verify to continue.",
      success: true,
      data: {
        email: email,
        expiresIn: otpResult.ttl
      }
    });

  } catch (error) {
    if (error.code === 'INVALID_CREDENTIALS' || error.code === 'NOT_VERIFIED') {
      return res.status(401).json({
        message: error.message,
        success: false,
      });
    }

    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error during login",
      success: false,
    });
  }
};

export const verifyLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
        success: false,
      });
    }

    // Use OTP service to verify OTP
    const verification = await verifyOTP(email, otp, OTP_TYPES.LOGIN);

    if (!verification.success) {
      return res.status(400).json({
        message: verification.message,
        success: false,
      });
    }

    // Get user from database
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
      path: "/",
    });

    // Send login success notification email
    await sendLoginSuccessEmail(email, user.name);

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

  } catch (error) {
    console.error("Verify login error:", error);
    return res.status(500).json({
      message: "Internal server error during login verification",
      success: false,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const redisKey = `revoked:${refreshToken}`;
        await redis.set(redisKey, "true", "EX", REFRESH_TOKEN_TTL_SECONDS);
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
      message: "Logged Out Successfully. Refresh Token revoked and cookie cleared.",
      success: true,
    });

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Internal server error during logout",
      success: false,
    });
  }
};