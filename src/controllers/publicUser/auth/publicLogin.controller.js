import redis from "../../../config/redisClient.js";
import { 
  publicLogin, 
  getPublicUserByEmail, 
  updateLastActive 
} from "../../../services/auth/public.auth.service.js";
import { generateOTP, OTP_TYPES, verifyOTP, invalidateOTP } from "../../../services/otp.service.js";
import { sendOTPEmail, sendLoginSuccessEmail } from "../../../services/email/email.service.js";
import { generateAccessToken, generateRefreshToken } from "../../../utils/token.js";

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
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

    // Authenticate user
    const user = await publicLogin(email, password);
    
    // Generate login OTP
    const otpResult = await generateOTP(
      email, 
      OTP_TYPES.LOGIN, 
      { 
        userId: user._id.toString(),
        userType: 'public'
      }
    );
    
    // Send OTP email
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
        userType: 'public',
        expiresIn: otpResult.ttl
      }
    });

  } catch (error) {    
    // Handle different error types with specific status codes
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
        data: {
          requiresVerification: true,
          email: req.body.email
        }
      });
    }
    
    if (error.code === 'ACCOUNT_LOCKED' || error.code === 'ACCOUNT_DISABLED') {
      return res.status(423).json({ // 423 Locked
        message: error.message,
        success: false,
      });
    }

    // Don't expose internal errors in production
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? "Internal server error during login" 
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

    // Verify OTP
    const verification = await verifyOTP(email, otp, OTP_TYPES.LOGIN);

    if (!verification.success) {
      return res.status(400).json({
        message: verification.message,
        success: false,
      });
    }

    // Get user and update last active
    const user = await getPublicUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        message: "Public user not found",
        success: false,
      });
    }

    // Update last active timestamp
    await updateLastActive(user._id);

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

    // send login success notification email
    await sendLoginSuccessEmail(email, user.name);

    return res.status(200).json({
      message: "Public user login verified successfully",
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          user_name: user.user_name,
          email: user.email,
          role: user.role,
          userType: 'public',
          isVerified: user.isVerified,
          isActive: user.isActive,
          profile: user.profile,
          engagement: {
            commentsCount: user.engagement.commentsCount,
            likesCount: user.engagement.likesCount,
            sharesCount: user.engagement.sharesCount,
            lastActive: user.engagement.lastActive
          },
          createdAt: user.createdAt
        },
        accessToken,
      },
    });

  } catch (error) {
    console.error("Public verify login error:", error);
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

// check login status endpoint
export const checkLoginStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    const user = await getPublicUserByEmail(email);
    
    if (!user) {
      return res.status(200).json({
        success: true,
        data: {
          exists: false,
          canLogin: false,
          message: "Account not found"
        }
      });
    }

    const statusData = {
      exists: true,
      canLogin: user.isVerified && user.isActive && !user.isLocked(),
      isVerified: user.isVerified,
      isActive: user.isActive,
      isLocked: user.isLocked(),
      user_name: user.user_name,
      email: user.email,
      lastActive: user.engagement.lastActive
    };

    // lock information if account is locked
    if (user.isLocked()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      statusData.lockRemainingMinutes = remainingTime;
      statusData.message = `Account locked. Try again in ${remainingTime} minutes.`;
    } else if (!user.isVerified) {
      statusData.message = "Please verify your email to login.";
    } else if (!user.isActive) {
      statusData.message = "Account is disabled.";
    } else {
      statusData.message = "Account is ready for login.";
    }

    return res.status(200).json({
      success: true,
      data: statusData
    });

  } catch (error) {
    console.error("Check login status error:", error);
    return res.status(500).json({
      message: "Server error while checking login status",
      success: false,
    });
  }
};