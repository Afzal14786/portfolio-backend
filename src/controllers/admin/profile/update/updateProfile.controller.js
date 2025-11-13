import { adminModel } from "../../../../models/admin/user.model.js";
import { cloudinary } from "../../../../config/cloudinary.js";

/**
 * @description this file is responsibel for updating the admins's profile
 * The admin is able to update:
 *    1. name & user_name
 *    2. profile_image
 *    3. banner_image
 *    4. resume
 *    5. social_media
 *    6. reading_resources
 *    7. quote
 *    8. Hobbies
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
    if (!allowedImageType.includes(profileImageFile.mimetype)) {
      return res.status(400).json({
        message: "Only JPEG, JPG, PNG & WebP images are allowed",
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

    if (user.profile_image && user.profile_image.public_id) {
      try {
        await cloudinary.uploader.destroy(user.profile_image.public_id);
      } catch (deleteErr) {
        console.warn(`Failed to delete the old profile : ${deleteErr}`);
      }
    }

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
      ).select("profile_image banner_image name user_name email");

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
    if (!allowedImageType.includes(bannerImageFile.mimetype)) {
      return res.status(400).json({
        message: "Only JPEG, JPG, PNG & WebP images are allowed",
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
      ).select("profile_image banner_image name user_name email");

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
    const resumeFile = req.file;

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

    if (!allowedTypes.includes(resumeFile.mimetype)) {
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

    if (user.resume && user.resume.public_id) {
      try {
        await cloudinary.uploader.destroy(user.resume.public_id, {
          resource_type: "raw",
        });
      } catch (deleteErr) {
        console.warn(`Failed to delete the old resume : ${deleteErr}`);
      }
    }

    const uploadedResume = await cloudinary.uploader.upload(resumeFile.path, {
      folder: "admin/resumes",
      resource_type: "raw"
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
      ).select("resume name user_name email");

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
        message: "Social media data is required and must be an object",
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
      (platform) => !allowedPlatforms.includes(platform)
    );

    if (invalidPlatform.length > 0) {
      return res.status(400).json({
        message: `Invalid social media platforms: ${invalidPlatform.join(", ")}`,
        success: false,
        allowedPlatforms,
      });
    }

    const updatedUser = await adminModel
      .findByIdAndUpdate(
        userId,
        { social_media: socialMedia },
        { new: true, runValidators: true }
      ).select("social_media name user_name");

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

// ------------------------------ Update The Reading Resources ------------------------------
export const updateReadingResources = async (req, res) => {
  try {
    const userId = req.user._id;
    const { readingResources } = req.body;

    if (!Array.isArray(readingResources)) {
      return res.status(400).json({
        message: "Reading resources must be an array",
        success: false,
      });
    }

    const invalidResource = readingResources.filter(
      (resources) =>
        !resources.title ||
        !resources.url ||
        typeof resources.title !== "string" ||
        typeof resources.url !== "string"
    );

    if (invalidResource.length > 0) {
      return res.status(400).json({
        message: "Each reading resource must have a title and the url",
        success: false,
      });
    }

    const updatedUser = await adminModel
      .findByIdAndUpdate(
        userId,
        { reading_resources: readingResources },
        { new: true }
      ).select("reading_resources name user_name email");

    return res.status(200).json({
      message: "Reading resources updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(`Error updating reading resources : ${error}`);
    return res.status(500).json({
      message: "Internal server error while updating the reading resources",
      success: false,
    });
  }
};

// ------------------------------ Update The Quote ------------------------------
export const updateQuote = async (req, res) => {
  try {
    const userId = req.user._id;
    const { quote } = req.body;

    if (!quote || typeof quote !== "string") {
      return res.status(400).json({
        message: "Quote is required and must be a string",
        success: false,
      });
    }

    if (quote.length > 200) {
      return res.status(400).json({
        message: "Quote cannot exceed 200 characters",
        success: false,
      });
    }

    const updatedUser = await adminModel
      .findByIdAndUpdate(
        userId,
        { quote: quote },
        { new: true, runValidators: true }
      ).select("quote name user_name email");

    return res.status(200).json({
      message: "The quote updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(`Error while updating the quote : ${error}`);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid quote data",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while updating quote",
    });
  }
};

// ------------------------------ Update The Hobbies ------------------------------
export const updateHobbies = async (req, res) => {
  try {
    const userId = req.user._id;
    const { hobbies } = req.body;

    if (!Array.isArray(hobbies)) {
      return res.status(400).json({
        message: "Hobbies must be an array",
        success: false,
      });
    }

    if (hobbies.some((hobby) => typeof hobby !== "string")) {
      return res.status(400).json({
        message: "All hobbies must be strings",
        success: false,
      });
    }

    const updatedUser = await adminModel.findByIdAndUpdate(
      userId,
      { hobbies },
      { new: true }
    ).select("hobbies name user_name email");

    return res.status(200).json({
      message: "The hobbies are updated",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(`Error while updating the hobbies : ${error}`);
    return res.status(500).json({
      message: "Internal server error while updating the hobbies",
      success: false,
    });
  }
};

// ------------------------------ Update Basic Info {name, user_name} ------------------------------
export const updateBasicInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, user_name } = req.body;

    if (!name && !user_name) {
      return res.status(400).json({
        message: "At least one field (name or user_name) is required",
        success: false,
      });
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (user_name) updateFields.user_name = user_name;

    const updatedUser = await adminModel
      .findByIdAndUpdate(userId, updateFields, {
        new: true,
        runValidators: true,
      }).select("name user_name email profile_image banner_image");

    return res.status(200).json({
      message: "Profile information updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(`Error while updating the basic info : ${error}`);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid profile data",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while updating profile",
    });
  }
};

// ------------------------------ Bulk Update ------------------------------
export const updateProfileBulk = async(req, res)=> {
  try {
    const userId = req.user._id;
    const updates = req.body;

    if (!updates || typeof updates !== "object") {
      return res.status(400).json({
        message: "Update data is required",
        success: false
      });
    }

    const allowedFields = ['name', 'user_name', 'social_media', 'reading_resources', 'quote', 'hobbies'];
    const invalidFields = Object.keys(updates).filter(
      field => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid fields: ${invalidFields.join(', ')}`,
        allowedFields,
        success: false
      });
    }

    const updatedUser = await adminModel.findByIdAndUpdate(
      userId,
      updates,
      {new: true, runValidators: true}
    ).select("-password -temporaryPassword -loginAttempts -lockUntil");

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user: updatedUser
    });

  }catch(error) {
    console.error(`Error while updating the bulk profile : ${error}`);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Username already exists",
        success: false
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid update data",
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      message: "Internal server error while updating bulk profile",
      success: false
    });
  }
}