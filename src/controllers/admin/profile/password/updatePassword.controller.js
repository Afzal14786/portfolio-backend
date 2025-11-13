import { adminModel } from "../../../../models/admin/user.model.js";
import { sendOTPEmail, sendPasswordChangedEmail } from "../../../../services/email/email.service.js";
import { generateOTP, OTP_TYPES, verifyOTP, invalidateOTP } from "../../../../services/otp.service.js";
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

  if (newPassword === oldPassword) {
    return res.status(400).json({
      message: "Old & New Password cannot be same",
      success: false,
    });
  }

  try {
    const user = await adminModel.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Authentication failed. User not found.",
        success: false,
      });
    }

    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect old password.",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await adminModel.findByIdAndUpdate(userId, {
      temporaryPassword: hashedPassword
    });

    // Generate OTP for password update verification
    const otpResult = await generateOTP(
      user.email,
      OTP_TYPES.PASSWORD_UPDATE,
      { 
        userId: user._id.toString(),
        userEmail: user.email,
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
      // clean if the otp send is failed
      await adminModel.findByIdAndUpdate(userId, {
        $unset: { temporaryPassword: 1 }
      });

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
    const user = await adminModel.findById(userId).select('+temporaryPassword');
    if (!user) {
      return res.status(404).json({ 
        message: "User not found.", 
        success: false 
      });
    }

    if (!user.temporaryPassword) {
      return res.status(400).json({
        message: "password update session expired or not found. Please start again",
        success: false,
      });
    }

    const verification = await verifyOTP(user.email, otp, OTP_TYPES.PASSWORD_UPDATE);
    if (!verification.success) {
      return res.status(400).json({
        message: verification.message,
        success: false
      });
    }


    // OTP is valid - update user's password using the stored hashed password from OTP metadata

    user.password = user.temporaryPassword;
    user.temporaryPassword = undefined;
    await user.save();

    // Send password changed confirmation email
    await sendPasswordChangedEmail(user.email, user.name);

    return res.status(200).json({ 
      message: "Password updated successfully.", 
      success: true 
    });

  } catch (err) {
    console.error("Error confirming password update:", err.message);
    try {
      await adminModel.findByIdAndUpdate(userId, {
        $unset: {temporaryPassword: 1}
      });
    } catch(cleanError) {
      console.error(`Failed to clean temporaryPassword : ${cleanError}`)
    }
    
    return res.status(500).json({
      message: "Server error during password update.",
      success: false,
    });
  }
};
