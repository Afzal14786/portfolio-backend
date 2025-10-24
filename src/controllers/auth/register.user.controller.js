import { registerUser, verifyAndCreateUser } from "../../services/auth/auth.service.js";
import { generateOTP, OTP_TYPES, verifyOTP, invalidateOTP } from "../../services/otp.service.js";
import { sendOTPEmail, sendWelcomeEmail } from "../../services/email/email.service.js";

export const register = async (req, res) => {
  try {
    const { name, user_name, email, password } = req.body;

    if (!name || !user_name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // auth service to handle registration logic
    const userData = await registerUser({ name, user_name, email, password });
    
    // Generate OTP using OTP service
    const otpResult = await generateOTP(
      email, 
      OTP_TYPES.REGISTRATION, 
      userData
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
      message: "Registration successful! Please check your email to verify your account.",
      success: true,
      data: {
        email: email,
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

    console.error("Registration error:", err);
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

    // Create user in database using the stored metadata
    const authResult = await verifyAndCreateUser(verification.metadata);

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
        },
        accessToken: authResult.accessToken,
      },
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    
    if (error.code === 11000 && error.keyValue) {
      return res.status(409).json({
        message: `Duplicate field: ${Object.keys(error.keyValue)[0]} already exists`,
        success: false,
      });
    }

    return res.status(500).json({
      message: "Server error during OTP verification",
      success: false,
    });
  }
};