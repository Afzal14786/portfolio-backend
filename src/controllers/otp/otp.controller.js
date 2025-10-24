import { 
  generateOTP, 
  verifyOTP, 
  resendOTP, 
  getStoredOTPData,
  OTP_TYPES 
} from "../../services/otp.service.js";
import { sendOTPEmail, sendWelcomeEmail } from "../../services/email.service.js";
import { verifyAndCreateUser, loginUser } from "../../services/auth.service.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.generator.js";

export const requestOTP = async (req, res) => {
  try {
    const { email, type, metadata } = req.body;

    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP type are required"
      });
    }

    // Validate OTP type
    const validTypes = Object.values(OTP_TYPES);
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP type"
      });
    }

    const result = await generateOTP(email, type, metadata);
    
    // Send OTP via email
    const emailSent = await sendOTPEmail(
      email, 
      result.otp, 
      type, 
      metadata?.name
    );

    if (!emailSent) {
      await invalidateOTP(email, type);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again."
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      data: {
        email,
        type,
        expiresIn: result.ttl
      }
    });

  } catch (error) {
    console.error("OTP request error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while sending OTP"
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    if (!email || !otp || !type) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and type are required"
      });
    }

    const verification = await verifyOTP(email, otp, type);
    
    if (!verification.success) {
      return res.status(400).json(verification);
    }

    let responseData = {
      success: true,
      message: verification.message
    };

    // Handle different OTP types
    switch (type) {
      case OTP_TYPES.REGISTRATION:
        const userData = await getStoredOTPData(email, OTP_TYPES.REGISTRATION);
        if (userData && userData.metadata) {
          const authResult = await verifyAndCreateUser(userData.metadata);
          responseData.data = {
            user: {
              id: authResult.user._id,
              user_name: authResult.user.user_name,
              email: authResult.user.email,
            },
            accessToken: authResult.accessToken
          };
          
          // Send welcome email
          await sendWelcomeEmail(email, userData.metadata.name);
        }
        break;

      case OTP_TYPES.LOGIN:
        const user = await loginUser(email, ''); // Password already verified in login step
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        
        responseData.data = {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
          accessToken,
          refreshToken
        };
        break;

      case OTP_TYPES.PASSWORD_RESET:
        // Generate password reset token
        const resetToken = generateAccessToken({ email }); // Short-lived token
        responseData.data = { resetToken };
        break;

      default:
        break;
    }

    return res.status(200).json(responseData);

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during OTP verification"
    });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP type are required"
      });
    }

    const result = await resendOTP(email, type);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Send the new OTP via email
    const emailSent = await sendOTPEmail(email, result.otp, type);

    if (!emailSent) {
      await invalidateOTP(email, type);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again."
      });
    }

    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully",
      data: {
        expiresIn: result.ttl
      }
    });

  } catch (error) {
    console.error("OTP resend error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while resending OTP"
    });
  }
};