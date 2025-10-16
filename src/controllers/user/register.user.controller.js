import { userModel } from "../../models/user.model.js";
import { sendEmail } from "../../emails/sendEmail.js";
import { generateOtp } from "../../utils/opt.js";
import redis from "../../config/redisClient.js";
import bcrypt from "bcryptjs";


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

    const hashPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    // The temporary user data to be saved to Redis
    const unverifiedUserData = {
      name: name,
      user_name: user_name,
      email: email,
      password: hashPassword,
      otp: otp,
    };
    
    const redisKey = `unverified:${email}`;

    await redis.set(redisKey, JSON.stringify(unverifiedUserData), "EX", 120);


    // send email
    const subject = "Action Required: Verify Your Account";
    const htmlBody = `
<div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0; text-align: center;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #007bff, #00c6ff); padding: 28px 0; border-radius: 10px 10px 0 0; max-width: 600px; margin: 0 auto;">
    <img src=${'../../assets/code.png'} alt="iamafzal.tech Logo" width="60" style="margin-bottom: 10px;" />
    <h1 style="color: #fffbe7; font-size: 26px; font-weight: 600; margin: 0;">${subject}</h1>
  </div>

  <!-- Body Card -->
  <div style="background: #ffffff; max-width: 600px; margin: 0 auto; padding: 30px 25px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: left;">
    
    <p style="font-size: 16px; color: #333; margin-top: 0;">
      Hello <b>${user.name || "User"}</b>,
    </p>

    <p style="font-size: 15.5px; color: #555; margin-bottom: 24px;">
      Thank you for registering with our service! Please use the following One-Time Password (OTP) to complete your account verification:
    </p>

    <!-- OTP Box -->
    <div style="text-align: center; margin: 30px 0;">
      <div style="
        display: inline-block;
        padding: 18px 40px;
        background: linear-gradient(135deg, #e0f7ff, #ccefff);
        border: 2px dashed #007bff;
        border-radius: 8px;
        font-size: 32px;
        font-weight: 700;
        letter-spacing: 6px;
        color: #212529;
        box-shadow: 0 3px 6px rgba(0,123,255,0.15);
        user-select: all;
      ">
        ${otp}
      </div>
    </div>

    <p style="font-size: 14.5px; text-align: center; color: #dc3545;">
      Note: This code is valid for <b>2 minutes</b> only.
    </p>

    <p style="font-size: 15px; color: #444; margin-top: 28px;">
      If you did not initiate this account creation, please ignore this email. Your account will not be activated.
    </p>

    <p style="font-size: 14px; color: #555; margin-top: 24px;">
      Thank you,<br/>
      <b>The iamafzal.tech Team</b>
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


    const emailSent = await sendEmail({
      to: email,
      subject,
      html: htmlBody,
      text: `Your OTP is ${otp}. It expires in 2 minute.`,
    });

    // handle email failure and cleanup
    if (!emailSent) {
      // if email failed, delete the temporary data from Redis
      await redis.del(redisKey);
      return res.status(503).json({
        message:
          "Registration failed: Could not send verification email. Please try again later.",
        success: false,
      });
    }
    
    return res.status(200).json({
      message: "Registration successful! Please check your email to verify your account.",
      success: true,
      data: {
        email: email
      }
    });

  } catch (err) {
    // even if something throws, avoid double response
    if (res.headersSent) {
      console.warn("Headers already sent — skipping second response");
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