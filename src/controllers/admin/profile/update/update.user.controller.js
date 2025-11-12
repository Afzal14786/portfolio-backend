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