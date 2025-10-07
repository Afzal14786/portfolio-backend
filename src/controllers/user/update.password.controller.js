import { userModel } from "../../models/user.model.js";
import { OtpCodeModel } from "../../schemas/user/OtpCodeModel.js";
import { sendEmail } from "../../emails/sendEmail.js";
import { generateOtp } from "../../utils/opt.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const requestPasswordUpdate = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required",
        success: false,
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Remove any existing OTP for same email
    await OtpCodeModel.deleteOne({ email });

    const otp = generateOtp();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const hashedPassword = await bcrypt.hash(newPassword, 10);


    await OtpCodeModel.create({
      name: user.name,
      user_name: user.user_name,
      email: user.email,
      password: hashedPassword,
      otp: hashedOtp,
      purpose: "update_password",
    });

    const subject = "Verify OTP to Update Your Password";
    const htmlBody = `
<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333;">
  <div style="max-width: 600px; margin: 20px auto; padding: 20px; border-radius: 10px; background: #ffffff; border: 1px solid #ddd;">
    <h2 style="color: #007bff; text-align: center;">${subject}</h2>
    <p>Hello <b>${user.name}</b>,</p>
    <p>We received a request to update your password. Use the following OTP to confirm the change:</p>
    <div style="text-align: center; font-size: 28px; font-weight: bold; margin: 20px 0; background: #f9f9f9; padding: 10px; border-radius: 6px; border: 1px dashed #aaa;">
      ${otp}
    </div>
    <p style="color: #d9534f;">This OTP will expire in 2 minutes.</p>
    <p>If you did not request this change, please ignore this email.</p>
    <p style="font-size: 12px; text-align: center; color: #999;">© ${new Date().getFullYear()} iamafzal.tech</p>
  </div>
</div>`;

    await sendEmail({
      to: email,
      subject,
      html: htmlBody,
      text: `Your OTP to update password is ${otp}. It expires in 2 minutes.`,
    });

    return res.status(200).json({
      message: "OTP sent successfully to your email.",
      success: true,
    });
  } catch (err) {
    console.error("Error during password update request:", err.message);
    return res.status(500).json({
      message: "Server error while sending OTP.",
      success: false,
    });
  }
};

// verify the otp

export const verifyPasswordOtpAndUpdate = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
        success: false,
      });
    }

    const otpData = await OtpCodeModel.findOne({
      email,
      purpose: "update_password",
    });
    if (!otpData) {
      return res.status(404).json({
        message: "Invalid or expired OTP",
        success: false,
      });
    }

    const submittedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (submittedOtp !== otpData.otp) {
      return res.status(401).json({
        message: "Invalid OTP",
        success: false,
      });
    }

    // Update user's password
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    user.password = otpData.password;
    await user.save();

    await OtpCodeModel.deleteOne({ email });

    return res.status(200).json({
      message: "Password updated successfully after OTP verification",
      success: true,
    });
  } catch (err) {
    console.error("Error verifying password OTP:", err.message);
    return res.status(500).json({
      message: "Server error during OTP verification",
      success: false,
    });
  }
};
