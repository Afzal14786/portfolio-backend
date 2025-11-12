import { adminModel } from "../../../../models/admin/user.model.js";
import {
  generateOTP,
  OTP_TYPES,
  verifyOTP,
  invalidateOTP,
} from "../../../../services/otp.service.js";
import {
  sendOTPEmail,
  sendNotificationEmail,
} from "../../../../services/email/email.service.js";

/**
 * Send OTP to update email
 */
export const updateEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({
        message: "Please provide new email ID",
        success: false,
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email ID",
        success: false,
      });
    }

    // Check if new email is already taken
    const existUser = await adminModel.findOne({ email: newEmail });
    if (existUser) {
      return res.status(400).json({
        message: "This email is already registered with another account",
        success: false,
      });
    }

    // Get current user by ID (not by email)
    const currentUser = await adminModel.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if same email
    if (currentUser.email === newEmail) {
      return res.status(400).json({
        message: "This is already your current email address",
        success: false,
      });
    }

    // Generate OTP
    const otpResult = await generateOTP(newEmail, OTP_TYPES.EMAIL_UPDATE, {
      userId: userId.toString(),
      currentEmail: currentUser.email,
      newEmail: newEmail,
      userName: currentUser.name || currentUser.user_name, // Fixed field name
      userType: currentUser.role,
    });

    if (!otpResult.success) {
      return res.status(500).json({
        message: "Failed to generate OTP. Please try again.",
        success: false,
        error: otpResult.error,
      });
    }

    // Send OTP email
    const emailSent = await sendOTPEmail(
      newEmail,
      otpResult.otp,
      "email_update",
      currentUser.name || currentUser.user_name // Fixed field name
    );

    if (!emailSent) {
      await invalidateOTP(newEmail, OTP_TYPES.EMAIL_UPDATE);
      return res.status(500).json({
        message: "Failed to send OTP email. Please try again.",
        success: false,
      });
    }

    return res.status(200).json({
      message: "OTP sent to your new email ID, please verify for update",
      success: true,
      ttl: otpResult.ttl,
      email: newEmail,
    });
  } catch (error) {
    console.error("Error in updateEmail:", error);
    return res.status(500).json({
      message: "Internal server error while processing email update",
      success: false,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verify OTP and update email
 */
export const verifyOtp = async (req, res) => {
  try {
    const userId = req.user._id;
    const userEmail = req.user.email;
    const username = req.user.user_name;
    console.log(`username : ${username}`);
    const { newEmail, otp } = req.body;

    if (!newEmail || !otp) {
      return res.status(400).json({
        message: "New Email and OTP are required",
        success: false,
      });
    }

    const verification = await verifyOTP(newEmail, otp, OTP_TYPES.EMAIL_UPDATE);

    if (!verification.success) {
      return res.status(400).json({
        message: verification.message,
        success: false,
        error: verification.error,
        remainingAttempts: verification.remainingAttempts,
      });
    }

    if (
      verification.metadata?.userId &&
      verification.metadata.userId !== userId.toString()
    ) {
      return res.status(400).json({
        message: "OTP verification failed. Please request a new OTP",
        success: false,
      });
    }

    // Update user email
    const updatedUser = await adminModel
      .findByIdAndUpdate(
        userId,
        { email: newEmail },
        { new: true, runValidators: true }
      )
      .select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Send notification to old email
    try {
      await sendNotificationEmail("email_change", {
        email: userEmail,
        userName: username,
        activityDescription: `Account email changed - ${userEmail} → ${newEmail}`,
        detectedAt: new Date(),
      });
    } catch (emailError) {
      console.error("Failed to send notification:", emailError);
    }

    // need to display the email immidate
    return res.status(200).json({
      success: true,
      message: "Email updated successfully",
      data: {
        email: newEmail,
      },
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({
      message: "Internal server error while verifying OTP",
      success: false,
    });
  }
};
