import { userModel } from "../../models/user.model.js";
import { OtpCodeModel } from "../../schemas/OtpCodeModel.js";
import { sendEmail } from "../../emails/sendEmail.js";
import crypto from "crypto";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/token.js";

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({
      message: "Email & OTP is required",
      success: false,
    });
  }

  try {
    const otpData = await OtpCodeModel.findOne({ email });
    if (!otpData) {
      return res.status(404).json({
        message: "Invalid or expired OTP. Please register again",
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

    // create permanent user
    const newUser = await userModel.create({
      // assuming you fixed the user_id issue by removing the field or auto-generating it
      name: otpData.name,
      user_name: otpData.user_name,
      email: otpData.email,
      password: otpData.password,
      isVerified: true,
    });

    console.log(otpData.password);

    // delete temporary data
    await OtpCodeModel.deleteOne({ email });

    // issue Tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send Welcome Email
    const subject = "Welcome Aboard! Your Account is Ready 🎉";
    
    const htmlBody = `
<div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
        
        <h1 style="color: #28a745; font-size: 24px; text-align: center; margin-bottom: 20px; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
            ${subject}
        </h1>
        
        <p style="font-size: 16px;">
            Hello <b>${newUser.name}</b>,
        </p>

        <p style="font-size: 16px;">
            Great news! Your account has been successfully created and verified. You are officially ready to explore everything our service has to offer.
        </p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "YOUR_LOGIN_URL"}" 
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
                cursor: pointer;
            ">
                Go to Login
            </a>
        </div>
        
        <p style="font-size: 15px; margin-top: 20px;">
            You can now log in using your registered email and password.
        </p>
        
        <p style="font-size: 14px; margin-top: 30px;">
            If you have any questions, please reply to this email! We're here to help.
        </p>
        
        <p style="font-size: 12px; color: #999999; text-align: center; margin-top: 40px;">
            © ${new Date().getFullYear()} iamafzal.tech
        </p>
        
    </div>
</div>
`;
    try {
        await sendEmail({
            to: newUser.email,
            subject: subject,
            html: htmlBody,
            text: `Hello ${newUser.name}, your account is verified and ready. You can log in now!`,
        });
    } catch (emailErr) {
        console.warn("Welcome email failed to send:", emailErr.message);
    }

    // final Response
    return res.status(200).json({
      message: "Account verified and registered successfully",
      success: true,
      user: {
        id: newUser._id,
        user_name: newUser.user_name,
        email: newUser.email,
      },
      accessToken: accessToken,
    });
  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({
      message: "Server error during verification.",
      success: false,
    });
  }
};