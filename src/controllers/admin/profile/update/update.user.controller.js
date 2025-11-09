import { adminModel } from "../../../../models/admin/user.model.js";
import { cloudinary } from "../../../../config/cloudinary.js";
import { generateOtp } from "../../../../utils/opt.js";
import redis from "../../../../config/redisClient.js";
import { sendEmail } from "../../../../emails/sendEmail.js";

const PLATFORM_NAME = "TerminalX";
const LOGO_PATH = "../../assets/code.png";

/* ---------------------- Update Name / Username ---------------------- */
export const updateName = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, user_name } = req.body;

    // Validation
    if (!name && !user_name) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least a 'name' or 'user_name' to update.",
      });
    }

    const updateFields = {};

    if (name) {
      updateFields.name = name.trim();
    }

    if (user_name) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,10}$/;
      if (!usernameRegex.test(user_name)) {
        return res.status(400).json({
          success: false,
          message:
            "Username must be 10 characters long and contain only letters, numbers, or underscores.",
        });
      }
      updateFields.user_name = user_name.trim();
    }

    const user = await adminModel
      .findByIdAndUpdate(
        userId,
        { $set: updateFields },
        { new: true, runValidators: true }
      )
      .select("name user_name email profile_image");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (err) {
    console.error("Error updating user profile:", err);

    if (err.code === 11000 && err.keyPattern?.user_name) {
      return res.status(400).json({
        success: false,
        message: "This username is already taken. Please choose another one.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while updating profile.",
    });
  }
};

/* ---------------------- Send OTP to Update Email ---------------------- */
export const updateEmailId = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: "New email is required.",
      });
    }

    // Check if email is already registered
    const existingUser = await adminModel.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "This email is already registered with another account. Please use a different one.",
      });
    }

    // Generate and store OTP
    const otp = generateOtp();
    const redisKey = `update_email:${userId}`;

    await redis.set(
      redisKey,
      JSON.stringify({ otp, newEmail }),
      "EX",
      300 // expires in 5 minutes
    );

    // Email template
    const subject = "📧 Verify OTP for TerminalX Email Update";
    const htmlBody = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 40px 0;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden;"> 
                <div style="background: linear-gradient(135deg, #0066ff, #00e0ff); padding: 28px 0; text-align: center; border-top-left-radius: 16px; border-top-right-radius: 16px;">
                <img src="${LOGO_PATH}" alt="${PLATFORM_NAME} Logo" width="70" height="70" style="display: block; margin: 0 auto 10px auto; border-radius: 50%; background: #ffffff22; padding: 8px;">
                <h1 style="color: #4be6f7ff; font-size: 26px; margin: 0; font-weight: 700; letter-spacing: 1px;">
                  ${PLATFORM_NAME} Email Update
                </h1>
              </div>

                
                <div style="padding: 32px 24px;">
                  <p style="font-size: 16px; color: #333333; margin-bottom: 16px;">
                    Hello <strong>${req.user.name || "User"}</strong>,
                  </p>

                  <p style="font-size: 15px; color: #444444; margin-bottom: 16px;">
                    We received a request to update your primary email address for your <strong>${PLATFORM_NAME}</strong> account to:
                  </p>

                  <p style="font-size: 16px; font-weight: bold; color: #007bff; text-align: center; margin-bottom: 24px;">
                    ${newEmail}
                  </p>

                  <p style="font-size: 15px; color: #444444; margin-bottom: 24px;">
                    To confirm and complete this change, please use the following One-Time Password (OTP):
                  </p>

                  <div style="text-align: center; margin: 30px 0;">
                    <div style="
                      display: inline-block;
                      padding: 20px 40px;
                      background: linear-gradient(135deg, #e0f7ff, #f0faff);
                      border: 2px dashed #007bff;
                      border-radius: 10px;
                      font-size: 34px;
                      font-weight: 700;
                      letter-spacing: 6px;
                      color: #007bff;
                      user-select: all;
                    ">
                      ${otpCode}
                    </div>
                  </div>

                  <p style="font-size: 14px; color: #666666; text-align: center; margin-top: 20px;">
                    This OTP will expire in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>. Do not share it with anyone.
                  </p>

                  <p style="font-size: 14px; color: #888888; margin-top: 30px; text-align: center;">
                    If you did not request this email change, please ignore this email. Your email address will remain unchanged.
                  </p>
                </div>

                <div style="background-color: #fafafa; text-align: center; padding: 16px; border-top: 1px solid #eee;">
                  <p style="font-size: 13px; color: #777;">
                    © ${new Date().getFullYear()} <a href="https://iamafzal.tech" style="color: #007bff; text-decoration: none;">iamafzal.tech</a> — All rights reserved.
                  </p>
                </div>

              </div>
            </div>
        `;
    // Send OTP email
    const emailSent = await sendEmail({
      to: newEmail,
      subject,
      html: htmlBody,
      text: `Your OTP for email update is ${otp}. It expires in 5 minutes.`,
    });

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your new email address. Please verify to continue.",
    });
  } catch (err) {
    console.error("Error in updateEmailId:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while sending email OTP.",
    });
  }
};

/* ---------------------- Verify OTP & Update Email ---------------------- */
export const verifyUpdateEmailOtp = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required for verification.",
      });
    }

    const redisKey = `update_email:${userId}`;
    const data = await redis.get(redisKey);

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new one.",
      });
    }

    const { otp: storedOtp, newEmail } = JSON.parse(data);

    if (storedOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // Update user's email
    await adminModel.findByIdAndUpdate(userId, { $set: { email: newEmail } });

    // Delete OTP from Redis
    await redis.del(redisKey);

    return res.status(200).json({
      success: true,
      message: "Email updated successfully.",
      newEmail,
    });
  } catch (err) {
    console.error("Error in verifyUpdateEmailOtp:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while verifying OTP.",
    });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileImageFile = req.file;
    if (!profileImageFile) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Find the user
    const user = await adminModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const updateFields = {};

    // If user already has a profile image, delete it from Cloudinary
    if (user.profile_image?.public_id) {
      await cloudinary.uploader.destroy(user.profile_image.public_id);
    }

    // Upload the new profile image to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(
      profileImageFile.path,
      {
        folder: "profile_images",
      }
    );

    updateFields.profile_image = {
      public_id: uploadedImage.public_id,
      url: uploadedImage.secure_url,
    };

    // Update user in DB
    const updatedUser = await adminModel
      .findByIdAndUpdate(userId, { $set: updateFields }, { new: true })
      .select("profile_image banner_image name user_name email");

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating profile image:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating profile image",
    });
  }
};

export const updateBannerImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const bannerImageFile = req.file;
    if (!bannerImageFile) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Find the user
    const user = await adminModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const updateFields = {};

    // If user already has a profile image, delete it from Cloudinary
    if (user.banner_image?.public_id) {
      await cloudinary.uploader.destroy(user.banner_image.public_id);
    }

    // Upload the new profile image to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(
      bannerImageFile.path,
      {
        folder: "banner_image",
      }
    );

    updateFields.banner_image = {
      public_id: uploadedImage.public_id,
      url: uploadedImage.secure_url,
    };

    // Update user in DB
    const updatedUser = await adminModel
      .findByIdAndUpdate(userId, { $set: updateFields }, { new: true })
      .select("profile_image banner_image name user_name email");

    return res.status(200).json({
      success: true,
      message: "Banner image updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating Banner image:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating banner image",
    });
  }
};

export const updateResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const { resume } = req.body;

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: "Please provide a resume file to upload.",
      });
    }

    const user = await adminModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Delete old resume if it exists
    if (user.resume?.public_id) {
      await cloudinary.uploader.destroy(user.resume.public_id, {
        resource_type: "raw",
      });
    }

    // Upload new resume (as raw type for PDF)
    const uploadedResume = await cloudinary.uploader.upload(resume, {
      folder: "terminalx/users/resumes",
      resource_type: "raw", // Required for non-image files like PDFs
    });

    const updatedUser = await adminModel
      .findByIdAndUpdate(
        userId,
        {
          $set: {
            resume: {
              public_id: uploadedResume.public_id,
              url: uploadedResume.secure_url,
            },
          },
        },
        { new: true }
      )
      .select("resume name user_name email");

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully.",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error in updateResume:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while uploading resume.",
    });
  }
};