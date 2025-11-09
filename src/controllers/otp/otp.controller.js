import { resendOTP, checkOTPExists, OTP_TYPES, invalidateOTP } from "../../services/otp.service.js";
import { sendOTPEmail } from "../../services/email/email.service.js";
import { getPublicUserByEmail } from "../../services/auth/public.auth.service.js";
import { getAdminByEmail } from "../../services/auth/admin.auth.service.js";

export const resendOtpController = async (req, res) => {
  try {
    const { email, type, userType } = req.body;

    // check if userType is provided
    if (!email || !type || !userType) {
      return res.status(400).json({
        message: "Email, OTP type, and user type are required",
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

    // Validate userType
    if (!['public', 'admin'].includes(userType)) {
      return res.status(400).json({
        message: "Invalid user type",
        success: false,
      });
    }

    let userName = 'User';
    let user = null;
    let userId = null;
    
    // Handle different OTP types appropriately
    if (type === OTP_TYPES.REGISTRATION) {
      // For registration OTP, user doesn't exist in DB yet
      userName = 'New User';
      console.log(`Registration OTP resend for ${email}, user not in DB yet`);
    } else {
      // For all other OTP types, user should exist
      try {
        if (userType === 'public') {
          user = await getPublicUserByEmail(email);
        } else {
          user = await getAdminByEmail(email);
        }
        
        if (!user) {
          return res.status(404).json({
            message: `${userType === 'admin' ? 'Admin' : 'User'} not found. Please check the email address.`,
            success: false,
          });
        }
        
        userName = user.name;
        userId = user._id.toString();
        console.log(`Found ${userType} user: ${userName} for OTP type: ${type}`);
      } catch (error) {
        console.error(`Error finding ${userType} user for email ${email}:`, error);
        return res.status(404).json({
          message: `${userType === 'admin' ? 'Admin' : 'User'} not found.`,
          success: false,
        });
      }
    }

    // Call the resendOTP service
    const result = await resendOTP(email, type, { 
      userId: userId,
      userType: userType,
      userName: userName
    });

    if (!result.success) {
      return res.status(400).json({
        message: result.message || "Unable to resend OTP",
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
        userType: userType,
        type: type,
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
    const { email, type, userType } = req.query;

    if (!email || !type || !userType) {
      return res.status(400).json({
        message: "Email, OTP type, and user type are required",
        success: false,
      });
    }

    // Validate userType
    if (!['public', 'admin'].includes(userType)) {
      return res.status(400).json({
        message: "Invalid user type",
        success: false,
      });
    }

    const exists = await checkOTPExists(email, type);

    return res.status(200).json({
      success: true,
      data: {
        exists,
        email,
        type,
        userType,
        message: exists ? 'OTP is active' : 'No active OTP found'
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