import { userModel } from "../../models/user.model.js";
import { sendOTPEmail, sendPasswordChangedEmail } from "../../services/email/email.service.js";
import { generateOTP, OTP_TYPES, verifyOTP, invalidateOTP } from "../../services/otp.service.js";
import bcrypt from "bcryptjs";

export const updatePassword = async (req, res) => {
  const userId = req.user._id;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: "Please provide old password & new password",
      success: false,
    });
  }

  try {
    const user = await userModel.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Authentication failed. User not found.",
        success: false,
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect old password.",
        success: false,
      });
    }

    // Generate OTP for password update verification
    const otpResult = await generateOTP(
      user.email,
      OTP_TYPES.PASSWORD_UPDATE,
      { 
        userId: user._id.toString(),
        newPassword: await bcrypt.hash(newPassword, 10) // Store hashed password in OTP metadata
      }
    );

    // Send OTP email using email service
    const emailSent = await sendOTPEmail(
      user.email,
      otpResult.otp,
      OTP_TYPES.PASSWORD_UPDATE,
      user.name
    );

    if (!emailSent) {
      await invalidateOTP(user.email, OTP_TYPES.PASSWORD_UPDATE);
      return res.status(500).json({
        message: "Failed to send verification OTP, please try again",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Verification OTP sent to your email. Please check your inbox.",
      success: true,
      data: {
        email: user.email,
        expiresIn: otpResult.ttl
      }
    });

  } catch (err) {
    console.error("Error during logged-in password update request:", err);
    return res.status(500).json({
      message: "Server error while processing OTP request.",
      success: false,
    });
  }
};

export const verifyOtpPassword = async (req, res) => {
  const userId = req.user._id;
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ 
      message: "OTP is required", 
      success: false 
    });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: "User not found.", 
        success: false 
      });
    }

    // Use OTP service to verify OTP
    const verification = await verifyOTP(user.email, otp, OTP_TYPES.PASSWORD_UPDATE);

    if (!verification.success) {
      return res.status(400).json({
        message: verification.message,
        success: false,
      });
    }

    // OTP is valid - update user's password using the stored hashed password from OTP metadata
    user.password = verification.metadata.newPassword;
    await user.save();

    // Send password changed confirmation email
    await sendPasswordChangedEmail(user.email, user.name);

    return res.status(200).json({ 
      message: "Password updated successfully.", 
      success: true 
    });

  } catch (err) {
    console.error("Error confirming password update:", err.message);
    return res.status(500).json({
      message: "Server error during password update.",
      success: false,
    });
  }
};

// Optional: Update email address with OTP verification
export const updateEmail = async (req, res) => {
  const userId = req.user._id;
  const { newEmail, password } = req.body;

  if (!newEmail || !password) {
    return res.status(400).json({
      message: "New email and password are required",
      success: false,
    });
  }

  try {
    const user = await userModel.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password.",
        success: false,
      });
    }

    // Check if new email already exists
    const existingUser = await userModel.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists.",
        success: false,
      });
    }

    // Generate OTP for email update verification
    const otpResult = await generateOTP(
      newEmail, // Send OTP to the NEW email
      OTP_TYPES.EMAIL_UPDATE,
      { 
        userId: user._id.toString(),
        oldEmail: user.email,
        newEmail: newEmail
      }
    );

    // Send OTP email to the new email address
    const emailSent = await sendOTPEmail(
      newEmail,
      otpResult.otp,
      OTP_TYPES.EMAIL_UPDATE,
      user.name
    );

    if (!emailSent) {
      await invalidateOTP(newEmail, OTP_TYPES.EMAIL_UPDATE);
      return res.status(500).json({
        message: "Failed to send verification OTP to new email address",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Verification OTP sent to your new email address.",
      success: true,
      data: {
        newEmail: newEmail,
        expiresIn: otpResult.ttl
      }
    });

  } catch (err) {
    console.error("Error during email update request:", err);
    return res.status(500).json({
      message: "Server error while processing email update request.",
      success: false,
    });
  }
};

export const verifyEmailUpdate = async (req, res) => {
  const userId = req.user._id;
  const { otp, newEmail } = req.body;

  if (!otp || !newEmail) {
    return res.status(400).json({
      message: "OTP and new email are required",
      success: false,
    });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }

    // Use OTP service to verify OTP
    const verification = await verifyOTP(newEmail, otp, OTP_TYPES.EMAIL_UPDATE);

    if (!verification.success) {
      return res.status(400).json({
        message: verification.message,
        success: false,
      });
    }

    // Verify that the OTP metadata matches the request
    if (verification.metadata.newEmail !== newEmail || verification.metadata.userId !== user._id.toString()) {
      return res.status(400).json({
        message: "Invalid OTP for this email update request.",
        success: false,
      });
    }

    // Update user's email
    user.email = newEmail;
    await user.save();

    return res.status(200).json({
      message: "Email updated successfully.",
      success: true,
    });

  } catch (err) {
    console.error("Error confirming email update:", err.message);
    return res.status(500).json({
      message: "Server error during email update.",
      success: false,
    });
  }
};