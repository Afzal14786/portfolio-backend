import { userModel } from "../../models/user.model.js";
import { OtpCodeModel } from "../../schemas/OtpCodeModel.js";
import { sendEmail } from "../../emails/sendEmail.js";
import { generateOtp } from "../../utils/opt.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const register = async (req, res) => {
  try {
    const { name, user_name, email, password } = req.body;

    if (!name || !user_name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }

    const existingOtp = await OtpCodeModel.findOne({ email });
    if (existingOtp) {
      return res.status(400).json({
        message:
          "A verification code has already been sent. Please wait one minute or check your spam folder.",
        success: false,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Save OTP entry
    await OtpCodeModel.create({
      name,
      user_name,
      email,
      password: hashPassword,
      otp: hashedOtp,
    });

    const subject = "Action Required: Verify Your Account";
    const htmlBody = `
<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
        
        <h1 style="color: #007bff; font-size: 24px; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            ${subject}
        </h1>
        
        <p style="font-size: 16px;">
            Thank you for registering with our service! Please use the following One-Time Password (OTP) to complete your account verification.
        </p>

        <div style="text-align: center; margin: 30px 0;">
            <div style="
                display: inline-block;
                padding: 15px 30px;
                background-color: #f7f7f7; 
                border: 2px dashed #cccccc;
                border-radius: 8px;
                font-size: 32px;
                font-weight: 700;
                letter-spacing: 5px;
                color: #212529;
                user-select: all;
            ">
                ${otp}
            </div>
        </div>

        <p style="font-size: 15px; color: #dc3545; text-align: center; margin-top: 20px;">
            Note: This code is valid for 2 minutes only.
        </p>
        
        <p style="font-size: 14px; margin-top: 30px;">
            If you did not initiate this account creation, please ignore this email.
        </p>
        
        <p style="font-size: 12px; color: #999999; text-align: center; margin-top: 40px;">
            © ${new Date().getFullYear()} iamafzal.tech
        </p>
        
    </div>
</div>
`;

    const emailSent = await sendEmail({
      to: email,
      subject,
      html: htmlBody,
      text: `Your OTP is ${otp}. It expires in 2 minute.`,
    });

    // If email failed
    if (!emailSent) {
      await OtpCodeModel.deleteOne({ email });
      return res.status(503).json({
        message:
          "Registration failed: Could not send verification email. Please try again later.",
        success: false,
      });
    }

    // Success response — MUST return to stop further execution
    return res.status(202).json({
      message:
        "Registration data saved. Check your email for the verification code.",
      success: true,
      email,
    });
  } catch (err) {
    // even if something throws, avoid double response
    if (res.headersSent) {
      console.warn("⚠ Headers already sent — skipping second response");
      return;
    }

    console.error("Registration error:", err);

    if (err.code === 11000 && err.keyValue) {
      return res.status(409).json({
        message: `Duplicate field: ${
          Object.keys(err.keyValue)[0]
        } already exists`,
        success: false,
      });
    }

    return res.status(500).json({
      message: "Server error during registration",
      success: false,
    });
  }
};
