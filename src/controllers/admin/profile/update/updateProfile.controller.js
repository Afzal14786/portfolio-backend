import { adminModel } from "../../../../models/admin/user.model.js";
import { cloudinary } from "../../../../config/cloudinary.js";

/**
 * @description This file contains the information for updating the admin's profile like
 * Admin can update
 *  1. profile picture
 *  2. Banner Picture
 *  3. Resume
 *  4. Skills
 *  6. Reading Resources
 *  7. Hobbies
 *  8. Social Media
 *  9. Quote
 */

// ------------------------------ Update The Profile Image ------------------------------
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

    const allowedImageType = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!allowedImageType.include(profileImageFile.mimetype)) {
      return res.status(400).json({
        message: "Only JPEG, JPG, PNG & WebP images are allowed",
        success: false,
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

    if (user.profile_image && user.profile_image.public_id) {
      try {
        // if the user have already an image, then delete it
        await cloudinary.uploader.destroy(user.profile_image.public_id);
      } catch (deleteErr) {
        console.warn(`Failed to delete the old profile : ${deleteErr}`);
      }
    }

    // Upload the new profile image to Cloudinary
    const uploadedImage = await cloudinary.uploader.upload(
      profileImageFile.path,
      {
        folder: "admin/profile_images",
        transformation: [
          { width: 500, height: 500, crop: "fill", gravity: "face" },
          { quality: "auto" },
        ],
      }
    );

    const updateUser = await adminModel
      .findByIdAndUpdate(
        userId,
        {
          profile_image: {
            public_id: uploadedImage.public_id,
            url: uploadedImage.secure_url,
          },
        },
        { new: true }
      )
      .select("profile_image banner_image name user_name email");

    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully.",
      user: updateUser,
    });
  } catch (err) {
    console.error("Error updating profile image:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating profile image",
    });
  }
};

// ------------------------------ Update The Banner Image ------------------------------
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

    const allowedImageType = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];
    if (!allowedImageType.include(profileImageFile.mimetype)) {
      return res.status(400).json({
        message: "Only JPEG, JPG, PNG & WebP images are allowed",
        success: false,
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

    if (user.banner_image && user.banner_image.public_id) {
      try {
        await cloudinary.uploader.destroy(user.banner_image.public_id);
      } catch (deleteErr) {
        console.warn(`Failed to delete the old banner image : ${deleteErr}`);
      }
    }

    const uploadedImage = await cloudinary.uploader.upload(
      bannerImageFile.path,
      {
        folder: "admin/banner_image",
        transformation: [
          { width: 1200, height: 400, crop: "fill" },
          { quality: "auto" },
        ],
      }
    );

    const updatedUser = await adminModel
      .findByIdAndUpdate(
        userId,
        {
          banner_image: {
            public_id: uploadedImage.public_id,
            url: uploadedImage.secure_url,
          },
        },
        { new: true }
      )
      .select("profile_image", "banner_image", "name", "user_name", "email");

    return res.status(200).json({
      message: "Banner Image updated successfully",
      success: true,
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

// ------------------------------ Update The Resume ------------------------------

export const updateResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const { resumeFile } = req.file;

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        message: "Please provide a resume file.",
      });
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.include(resumeFile.mimetype)) {
      return res.status(400).json({
        message: "Only PDF and Word documents are allowed",
        success: false,
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
    if (user.resume && user.resume.public_id) {
      try {
        await cloudinary.uploader.destroy(user.resume.public_id, {
          resource_type: "raw",
        });
      } catch (deleteErr) {
        console.warn(`Failed to delete the old resume : ${deleteErr}`);
      }
    }

    // Upload new resume (as raw type for PDF)
    const uploadedResume = await cloudinary.uploader.upload(resume, {
      folder: "admin/resumes",
    });

    const updatedUser = await adminModel
      .findByIdAndUpdate(
        userId,
        {
          resume: {
            public_id: uploadedResume.public_id,
            url: uploadedResume.secure_url,
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

// ------------------------------ Update The Social Media ------------------------------

export const updateSocialMedia = async (req, res) => {
  try {
    const userId = req.user._id;
    const { socialMedia } = req.body;

    if (!socialMedia || typeof socialMedia !== "object") {
      return res.status(400).json({
        message: "Socail media data is required and must be an object",
        success: false,
      });
    }

    const allowedPlatforms = [
      "github",
      "linkedin",
      "leetcode",
      "twitter",
      "instagram",
      "facebook",
      "portfolio",
      "medium",
      "blogSite",
    ];

    const invalidPlatform = Object.keys(socialMedia).filter(
      (platform) => !allowedPlatforms.include(platform)
    );

    if (invalidPlatform.length > 0) {
      return res.status(400).json({
        message: `Inavlid socail media platforms: ${invalidPlatform.join(
          ", "
        )}`,
        success: false,
        allowedPlatforms,
      });
    }

    const updatedUser = await adminModel
      .findByIdAndUpdate(
        userId,
        { social_media: socialMedia },
        { new: true, runValidators: true }
      )
      .select("social_media, name, user_name");

    return res.status(200).json({
      message: "Social media links updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating social media:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid social media data",
        error: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while updating social media",
    });
  }
};
