import { validateAdminRegistration, verifyAndCreateAdmin, getAdminByEmail } from "../../../services/auth/admin.auth.service.js";
import { generateOTP, OTP_TYPES, verifyOTP, invalidateOTP } from "../../../services/otp.service.js";
import { sendOTPEmail, sendWelcomeEmail } from "../../../services/email/email.service.js";

export const register = async (req, res) => {
  try {
    const { name, user_name, email, password } = req.body;

    console.log(`The user enter the following details : ${name, user_name, email, password}`);
    // Input validation
    if (!name || !user_name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
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

    if (user_name.length < 3 || user_name.length > 20) {
      return res.status(400).json({
        message: "Username must be between 3 and 20 characters",
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

    if (name.length < 2 || name.length > 15) {
      return res.status(400).json({
        message: "Name must be between 2 and 15 characters",
        success: false,
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
        success: false,
      });
    }

    // Validate admin registration data (does NOT create user in DB)
    const userData = await validateAdminRegistration({ name, user_name, email, password });

    // Generate OTP using OTP service
    const otpResult = await generateOTP(
      email,
      OTP_TYPES.REGISTRATION, 
      {
        ...userData,
        userType: 'admin'
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
      message: "Admin registration successful! Please check your email to verify your account.",
      success: true,
      data: {
        email: email,
        userType: 'admin',
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

    if (err.code === 'WEAK_PASSWORD') {
      return res.status(400).json({
        message: err.message,
        success: false,
      });
    }

    console.error("Admin registration error:", err);
    return res.status(500).json({
      message: "Server error during admin registration",
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

    const authResult = await verifyAndCreateAdmin(verification.metadata);

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
      message: "Admin account verified and registered successfully",
      success: true,
      data: {
        user: {
          id: authResult.user._id,
          user_name: authResult.user.user_name,
          email: authResult.user.email,
          role: authResult.user.role,
          userType: 'admin',
          isVerified: authResult.user.isVerified,
          isActive: authResult.user.isActive,
        },
        accessToken: authResult.accessToken,
      },
    });

  } catch (error) {
    console.error("Admin OTP verification error:", error);
    
    // Handle duplicate key errors (race condition protection)
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
      message: "Server error during admin OTP verification",
      success: false,
    });
  }
};

export const checkAdminRegistrationStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    const admin = await getAdminByEmail(email);
    
    return res.status(200).json({
      success: true,
      data: {
        exists: !!admin,
        isVerified: admin?.isVerified || false,
        isActive: admin?.isActive || false,
        email: email,
        canRegister: !admin // Can register if admin doesn't exist
      }
    });

  } catch (error) {
    console.error("Check admin registration status error:", error);
    return res.status(500).json({
      message: "Server error while checking admin registration status",
      success: false,
    });
  }
};