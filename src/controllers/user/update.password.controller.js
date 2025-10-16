import { userModel } from "../../models/user.model.js";
import { sendEmail } from "../../emails/sendEmail.js";
import { generateOtp } from "../../utils/opt.js";
import redis from "../../config/redisClient.js";
import bcrypt from "bcryptjs";

const OTP_TTL = 120; // 2 minutes in seconds
/**
 * Endpoint 1: Verifies old password and sends an OTP to the user's email
 * to confirm the new password change.
 * @requires req.user.id (from authentication middleware)
 */
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

    // verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect old password.",
        success: false,
      });
    }

    // data preparation and redis storage
    const otp = generateOtp();
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    const redisKey = `update_confirm:${user.email}`;

    const updateData = {
      newHashedPassword: newHashedPassword,
      otp: otp,
      purpose: "logged_in_update",
    };

    await redis.set(redisKey, JSON.stringify(updateData), "EX", 120);

    const subject = "Verify OTP to Update Your Password";
    const htmlBody = `
<div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f7f9fc; padding: 40px 0; text-align: center;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #007bff, #00c6ff); padding: 24px 0; border-radius: 10px 10px 0 0; max-width: 600px; margin: 0 auto;">
    <img src=${'../../assets/code.png'} alt="iamafzal.tech Logo" width="60" style="margin-bottom: 10px;" />
    <h1 style="color: #fffbe7; font-size: 26px; font-weight: 600; margin: 0;">TerminalX Password Update Verification</h1>
  </div>

  <!-- Body Card -->
  <div style="background: #ffffff; max-width: 600px; margin: 0 auto; padding: 30px 25px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: left;">

    <p style="font-size: 16px; color: #333; margin-top: 0;">
      Hello <b>${user.name}</b>,
    </p>

    <p style="font-size: 15.5px; color: #555; margin-bottom: 24px;">
      We received a request to change your account password. To confirm this action securely, please use the One-Time Password (OTP) below:
    </p>

    <!-- OTP Card -->
    <div style="text-align: center; margin: 30px 0;">
      <div style="
        display: inline-block;
        padding: 18px 40px;
        background: linear-gradient(135deg, #fff1cc, #ffe5b4);
        border: 2px dashed #ff8c00;
        border-radius: 8px;
        font-size: 32px;
        font-weight: 700;
        letter-spacing: 6px;
        color: #2c2c2c;
        box-shadow: 0 3px 6px rgba(255, 140, 0, 0.2);
        user-select: all;
      ">
        ${otp}
      </div>
    </div>

    <p style="font-size: 14.5px; text-align: center; color: #d9534f;">
      For your security, this OTP is valid for <b>2 minutes</b> only.
    </p>

    <p style="font-size: 15px; color: #444; margin-top: 28px;">
      If you didn’t request this password change, please ignore this email — your current password will remain safe.
    </p>

    <p style="font-size: 14px; color: #555; margin-top: 24px;">
      Thank you,<br/>
      <b>The iamafzal.tech Security Team</b>
    </p>

    <!-- Footer -->
    <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 12px;">
      <p style="font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} <b>iamafzal.tech</b> — All rights reserved.<br/>
        This is an automated email. Please do not reply.
      </p>
    </div>

  </div>
</div>
`;

    await sendEmail({
      to: user.email,
      subject,
      html: htmlBody,
      text: `Your OTP to update password is ${otp}. It expires in ${
        OTP_TTL / 60
      } minutes.`,
    });

    return res.status(200).json({
      message: "Verification OTP sent to your email. Please check your inbox.",
      success: true,
    });
  } catch (err) {
    console.error("Error during logged-in password update request:", err);
    return res.status(500).json({
      message: "Server error while processing OTP request.",
      success: false,
    });
  }
};

// ---

/**
 * Endpoint 2: Confirms the OTP and finalizes the password change for a logged-in user.
 * @requires req.user.id
 */
export const verifyOtpPassword = async (req, res) => {
  const userId = req.user._id;
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "OTP is required", success: false });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
    }

    const redisKey = `update_confirm:${user.email}`;
    const storedDataJson = await redis.get(redisKey);

    if (!storedDataJson) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP.", success: false });
    }

    const storedData = JSON.parse(storedDataJson);

    // 1. verify OTP
    if (otp !== storedData.otp) {
      return res.status(401).json({
        message: "Invalid OTP.",
        success: false,
      });
    }

    // 2. OTP is valid: Consume the token
    await redis.del(redisKey);

    // 3. Update user's password in MongoDB
    user.password = storedData.newHashedPassword; // Use the HASHED password from Redis
    await user.save();

    return res
      .status(200)
      .json({ message: "Password updated successfully.", success: true });
  } catch (err) {
    console.error("Error confirming password update:", err.message);
    return res.status(500).json({
      message: "Server error during password update.",
      success: false,
    });
  }
};

/**
 * reset password section
 */

export const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "email is required for resetting the password",
        success: false,
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists, a password reset link has been sent to your email.",
        success: true,
      });
    }

    const token = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.DASHBOARD_URL}/reset-password?token=${token}`;

    const subject = "Your Password Reset Link";
    const htmlBody = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
    <h2 style="color: #007bff; text-align: center;">Password Reset Request</h2>
    <p>Hello <b>${user.name}</b>,</p>
    <p>You recently requested to reset your password. Click the button below to proceed:</p>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="
            display: inline-block;
            padding: 12px 25px;
            background-color: #007bff; /* Primary Blue */
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
            letter-spacing: 0.5px;
        ">
            Reset Your Password
        </a>
    </div>

    <p style="font-size: 14px; color: #dc3545; text-align: center; margin-top: 20px;">
        This link is valid for 10 minutes. Please ignore if you did not make this request.
    </p>

    <p style="font-size: 12px; color: #999999; text-align: center; margin-top: 40px;">
        © ${new Date().getFullYear()} iamafzal.tech
    </p>
</div>`;

    await sendEmail({
      to: email,
      subject: subject,
      html: htmlBody,
      text: `Your password reset link: ${resetUrl}`,
    });

    return res.status(200).json({
      message:
        "If an account exists, a password reset link has been sent to your email.",
      success: true,
    });
  } catch (err) {
    console.error(`Error while resetting the password : ${err}`);
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
        message: "token, new password & confirm new password is required",
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "new password and confirm password do not match",
        success: false,
      });
    }

    const hashedToken = await crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Password reset token is expired or invalid. Please request a new link.",
        success: false,
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully. You can now log in.",
      success: true,
    });
  } catch (err) {
    console.log(`error while verifying the reset password : ${err.message}`);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
