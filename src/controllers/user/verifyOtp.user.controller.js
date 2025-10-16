import { userModel } from "../../models/user.model.js";
import { sendEmail } from "../../emails/sendEmail.js";
import redis from "../../config/redisClient.js";
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

  const redisKey = `unverified:${email}`;

  try {
    // retrieve the temporary user data from Redis
    const storedUserDataJson = await redis.get(redisKey);
    
    // Check if the key exists (meaning it hasn't expired)
    if (!storedUserDataJson) {
      return res.status(404).json({
        message: "Invalid or expired OTP. Please register again.",
        success: false,
      });
    }

    const storedUserData = JSON.parse(storedUserDataJson);
    
    if (otp !== storedUserData.otp) {
      return res.status(401).json({
        message: "Invalid OTP",
        success: false,
      });
    }

    await redis.del(redisKey);

    const newUser = await userModel.create({
      name: storedUserData.name,
      user_name: storedUserData.user_name,
      email: storedUserData.email,
      password: storedUserData.password,
      isVerified: true,
    });

    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const subject = "Welcome Aboard! Your Account is Ready 🎉";
    const htmlBody = `
<div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0; text-align: center;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #28a745, #71e18a); padding: 28px 0; border-radius: 10px 10px 0 0; max-width: 600px; margin: 0 auto;">
    <img src=${'../../assets/code.png'} alt="iamafzal.tech Logo" width="60" style="margin-bottom: 10px;" />
    <h1 style="color: #ffffff; font-size: 26px; font-weight: 600; margin: 0;">${subject}</h1>
  </div>

  <!-- Body Card -->
  <div style="background: #ffffff; max-width: 600px; margin: 0 auto; padding: 30px 25px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: left;">
    
    <p style="font-size: 16px; color: #333; margin-top: 0;">
      Hello <b>${newUser.name || "User"}</b>,
    </p>

    <p style="font-size: 16px; color: #555; margin-bottom: 24px;">
      🎉 Great news! Your account has been successfully created and verified. You are now officially part of the iamafzal.tech community and ready to explore all the features we offer.
    </p>

    <!-- Call-to-Action Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL || "YOUR_LOGIN_URL"}" 
         style="
          display: inline-block;
          padding: 14px 28px;
          background: linear-gradient(135deg, #007bff, #00c6ff);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
          font-size: 16px;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 10px rgba(0,123,255,0.3);
          transition: all 0.2s ease-in-out;
        "
        onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 14px rgba(0,123,255,0.4)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 10px rgba(0,123,255,0.3)';"
      >
        Go to Login
      </a>
    </div>

    <p style="font-size: 15px; color: #444; margin-top: 20px;">
      You can now log in using your registered email and password to get started.
    </p>

    <p style="font-size: 14px; color: #555; margin-top: 28px;">
      If you have any questions or need help, feel free to reply to this email. We're always here to support you.
    </p>

    <!-- Footer -->
    <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 12px;">
      <p style="font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} iamafzal.tech — All rights reserved.<br/>
        This is an automated email. Please do not reply.
      </p>
    </div>

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

    // 8. Final Response
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
      message: "Server error during verification or account creation.",
      success: false,
    });
  }
};