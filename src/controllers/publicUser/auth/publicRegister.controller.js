import { validateRegistrationData, verifyAndCreatePublic, getPublicUserByEmail } from "../../../services/auth/public.auth.service.js";
import { generateOTP, OTP_TYPES, verifyOTP, invalidateOTP } from "../../../services/otp.service.js";
import { sendOTPEmail, sendWelcomeEmail } from "../../../services/email/email.service.js";

export const register = async (req, res) => {
  try {
    const { name, user_name, email, password } = req.body;

    // Input validation
    if (!name || !user_name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,10})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
        success: false,
      });
    }

    // Username validation
    if (user_name.length < 3 || user_name.length > 15) {
      return res.status(400).json({
        message: "Username must be between 3 and 15 characters",
        success: false,
      });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(user_name)) {
      return res.status(400).json({
        message: "Username can only contain letters, numbers, and underscores",
        success: false,
      });
    }

    // Name validation
    if (name.length < 2 || name.length > 20) {
      return res.status(400).json({
        message: "Name must be between 2 and 20 characters",
        success: false,
      });
    }

    const userData = await validateRegistrationData({ name, user_name, email, password });
    
    // Generate OTP using OTP service
    const otpResult = await generateOTP(
      email, 
      OTP_TYPES.REGISTRATION, 
      { 
        ...userData, // passing validated user data {not created in DB yet}
        userType: 'public'
      }
    );
    
    // Send OTP email using email service
    const emailSent = await sendOTPEmail(
      email, 
      otpResult.otp, 
      'registration', 
      name
    );

    if (!emailSent) {
      await invalidateOTP(email, OTP_TYPES.REGISTRATION);
      return res.status(503).json({
        message: "Registration failed: Could not send verification email.",
        success: false,
      });
    }
    
    return res.status(200).json({
      message: "OTP sent to your email. Please verify to complete registration.",
      success: true,
      data: {
        email: email,
        userType: 'public',
        expiresIn: otpResult.ttl
      }
    });

  } catch (err) {
    if (err.code === 'USER_EXISTS') {
      return res.status(409).json({
        message: err.message,
        success: false,
      });
    }

    console.error("Public registration error:", err);
    return res.status(500).json({
      message: "Server error during registration",
      success: false,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
        success: false,
      });
    }

    // OTP service to verify OTP
    const verification = await verifyOTP(email, otp, OTP_TYPES.REGISTRATION);

    if (!verification.success) {
      return res.status(400).json({
        message: verification.message,
        success: false,
      });
    }

    const authResult = await verifyAndCreatePublic(verification.metadata);

    // Send welcome email
    await sendWelcomeEmail(email, verification.metadata.name);

    // Set refresh token as HTTP-only cookie
    res.cookie("refreshToken", authResult.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return res.status(200).json({
      message: "Account verified and registered successfully",
      success: true,
      data: {
        user: {
          id: authResult.user._id,
          user_name: authResult.user.user_name,
          email: authResult.user.email,
          role: authResult.user.role,
          userType: 'public',
          isVerified: authResult.user.isVerified,
        },
        accessToken: authResult.accessToken,
      },
    });

  } catch (error) {    
    // Handle duplicate key errors (in case someone registers same email during OTP wait)
    if (error.code === 11000 && error.keyValue) {
      const field = Object.keys(error.keyValue)[0];
      const message = field === 'email' 
        ? 'Email already registered. Please login instead.' 
        : 'Username already taken. Please try different username.';
      
      return res.status(409).json({
        message: message,
        success: false,
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: messages.join(', '),
        success: false,
      });
    }

    return res.status(500).json({
      message: "Server error during OTP verification",
      success: false,
    });
  }
};

export const checkRegistrationStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    const user = await getPublicUserByEmail(email);
    
    return res.status(200).json({
      success: true,
      data: {
        exists: !!user,
        isVerified: user?.isVerified || false,
        email: email
      }
    });

  } catch (error) {
    console.error("Check registration status error:", error);
    return res.status(500).json({
      message: "Server error while checking registration status",
      success: false,
    });
  }
};