import { createHash } from "crypto";
import { adminModel } from "../../../../models/admin/user.model.js";
import { sendEmail } from "../../../../emails/sendEmail.js";
import {getPasswordResetLinkTemplate, getPasswordChangedTemplate} from "../../../../services/email/email.templates.js"

import bcrypt from "bcryptjs";

export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log("Reset password request for:", email);   -- Testing Purpose
    
    if (!email) {
      return res.status(400).json({
        message: "Email is required for resetting the password",
        success: false,
      });
    }

    const user = await adminModel.findOne({ email });
    // console.log("Database query result:", user);   -- Testing Purpose
    
    if (!user) {
      // Return success even if user doesn't exist for security
      return res.status(200).json({
        message: "If an account exists, a password reset link has been sent to your email.",
        success: true,
      });
    }

    // if any existing reset tokens first, then clear it 
    
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // Generate password reset token (10 minutes expiry)
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.DASHBOARD_URL}/reset-password?token=${resetToken}`;

    // Use the dedicated token reset template
    const emailTemplate = getPasswordResetLinkTemplate(resetUrl, user.name, 10);

    await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    return res.status(200).json({
      message: "If an account exists, a password reset link has been sent to your email.",
      success: true,
    });

  } catch (err) {
    console.error(`Error while resetting the password: ${err}`);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const verifyReset = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Token, new password and confirm password are required",
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
        success: false,
      });
    }

    const hashedToken = createHash("sha256")
      .update(token)
      .digest("hex");
    
    const user = await adminModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        message: "Password reset token is expired or invalid. Please request a new link.",
        success: false,
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Send password changed confirmation email
    const successTemplate = getPasswordChangedTemplate(user.name);
    
    await sendEmail({
      to: user.email,
      subject: successTemplate.subject,
      html: successTemplate.html,
      text: successTemplate.text
    });

    return res.status(200).json({
      message: "Password reset successfully. You can now log in.",
      success: true,
    });

  } catch (err) {
    console.error(`Error while verifying reset password: ${err.message}`);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

