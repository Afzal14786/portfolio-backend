import { resendOTP, checkOTPExists, OTP_TYPES, invalidateOTP } from "../../services/otp.service.js";
import { sendOTPEmail } from "../../services/email/email.service.js";
import { getUserByEmail } from "../../services/auth/auth.service.js";

export const resendOtpController = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({
        message: "Email and OTP type are required",
        success: false,
      });
    }

    // Validate OTP type
    const validTypes = Object.values(OTP_TYPES);
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid OTP type",
        success: false,
      });
    }

    // Get user for name
    let userName = 'User';
    let user = null;
    try {
      user = await getUserByEmail(email);
      if (user) {
        userName = user.name;
      }
    } catch (error) {
      // User might not exist for registration, that's okay
      console.log('User not found for email:', email);
    }

    // Use your existing resendOTP service
    const result = await resendOTP(email, type, { userId: user?._id?.toString() });

    if (!result.success) {
      return res.status(400).json({
        message: result.message,
        success: false,
        error: result.error
      });
    }

    // Send the new OTP email
    const emailSent = await sendOTPEmail(email, result.otp, type, userName);

    if (!emailSent) {
      await invalidateOTP(email, type);
      return res.status(500).json({
        message: "Failed to send OTP email. Please try again.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "OTP resent successfully",
      success: true,
      data: {
        email: email,
        expiresIn: result.ttl
      }
    });

  } catch (error) {
    console.error("Resend OTP controller error:", error);
    return res.status(500).json({
      message: "Internal server error while resending OTP",
      success: false,
    });
  }
};

export const checkOtpStatus = async (req, res) => {
  try {
    const { email, type } = req.query;

    if (!email || !type) {
      return res.status(400).json({
        message: "Email and OTP type are required",
        success: false,
      });
    }

    const exists = await checkOTPExists(email, type);
    
    return res.status(200).json({
      success: true,
      data: {
        exists,
        email,
        type
      }
    });

  } catch (error) {
    console.error("Check OTP status error:", error);
    return res.status(500).json({
      message: "Internal server error while checking OTP status",
      success: false,
    });
  }
};