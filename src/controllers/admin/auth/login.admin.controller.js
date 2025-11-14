import redis from "../../../config/redisClient.js";
import { 
  adminLogin, 
  getAdminByEmail, 
  updateAdminLastActivity 
} from "../../../services/auth/admin.auth.service.js";
import { generateOTP, OTP_TYPES, verifyOTP, invalidateOTP } from "../../../services/otp.service.js";
import { sendOTPEmail, sendLoginSuccessEmail } from "../../../services/email/email.service.js";
import { generateAccessToken, generateRefreshToken } from "../../../utils/token.js";

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

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
        success: false,
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
        success: false,
      });
    }

    const user = await adminLogin(email, password);
    
    const otpResult = await generateOTP(
      email, 
      OTP_TYPES.LOGIN, 
      { 
        userId: user._id.toString(),
        userType: 'admin',
      }
    );
    
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
        userType: 'admin',
        expiresIn: otpResult.ttl
      }
    });

  } catch (error) {
    console.error("Admin login error for email:", req.body.email, "Error:", error.message);
    
    if (error.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        message: error.message,
        success: false,
      });
    }
    
    if (error.code === 'NOT_VERIFIED') {
      return res.status(403).json({
        message: error.message,
        success: false,
      });
    }
    
    if (error.code === 'ACCOUNT_LOCKED' || error.code === 'ACCOUNT_DISABLED') {
      return res.status(423).json({
        message: error.message,
        success: false,
      });
    }

    const errorMessage = process.env.NODE_ENV === 'production' 
      ? "Internal server error during admin login" 
      : error.message;

    return res.status(500).json({
      message: errorMessage,
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

    const verification = await verifyOTP(email, otp, OTP_TYPES.LOGIN);

    if (!verification.success) {
      return res.status(400).json({
        message: verification.message,
        success: false,
      });
    }

    const user = await getAdminByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "Admin user not found",
        success: false,
      });
    }

    await updateAdminLastActivity(user._id);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
      path: "/",
    });

    await sendLoginSuccessEmail(email, user.name);

    return res.status(200).json({
      message: "Admin login verified successfully",
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          userType: 'admin',
          isVerified: user.isVerified,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          profile_image: user.profile_image,
          blog_count: user.blog_count
        },
        accessToken,
        refreshToken,
      },
    });

  } catch (error) {
    console.error("Admin verify login error:", error);
    return res.status(500).json({
      message: "Internal server error during admin login verification",
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