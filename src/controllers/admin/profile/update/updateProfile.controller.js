import { adminModel } from "../../../../models/admin/user.model.js";
import { cloudinary } from "../../../../config/cloudinary.js";
import streamifier from 'streamifier'; // Required for memory buffer uploads

const safeReturnFields = "-password -__v -loginAttempts -lockUntil -temporaryPassword";

const streamUpload = (fileBuffer, options) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

export const updateProfileImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileImageFile = req.file;
    if (!profileImageFile) return res.status(400).json({ success: false, message: "No file uploaded" });

    const user = await adminModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    if (user.profile_image?.public_id) {
      try { await cloudinary.uploader.destroy(user.profile_image.public_id); } catch (e) { }
    }

    // FIX: Use streamUpload instead of file.path
    const uploadedImage = await streamUpload(profileImageFile.buffer, {
      folder: "admin/profile_images",
      transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }, { quality: "auto" }],
    });

    const updateUser = await adminModel.findByIdAndUpdate(
      userId,
      { profile_image: { public_id: uploadedImage.public_id, url: uploadedImage.secure_url } },
      { new: true }
    ).select(safeReturnFields); 

    return res.status(200).json({ success: true, message: "Profile image updated successfully.", user: updateUser });
  } catch (err) {
      console.error("Profile Upload Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error during upload" });
  }
};

export const updateBannerImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const bannerImageFile = req.file;
    if (!bannerImageFile) return res.status(400).json({ success: false, message: "No file uploaded" });

    const user = await adminModel.findById(userId);
    
    if (user.banner_image?.public_id) {
      try { await cloudinary.uploader.destroy(user.banner_image.public_id); } catch (e) { }
    }

    // FIX: Use streamUpload instead of file.path
    const uploadedImage = await streamUpload(bannerImageFile.buffer, {
      folder: "admin/banner_image",
      transformation: [{ width: 1200, height: 400, crop: "fill" }, { quality: "auto" }],
    });

    const updatedUser = await adminModel.findByIdAndUpdate(
      userId,
      { banner_image: { public_id: uploadedImage.public_id, url: uploadedImage.secure_url } },
      { new: true }
    ).select(safeReturnFields); 

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
     console.error("Banner Upload Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error during upload" });
  }
};

export const updateResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const resumeFile = req.file;
    if (!resumeFile) return res.status(400).json({ success: false, message: "Please provide a file." });

    const user = await adminModel.findById(userId);

    if (user.resume?.public_id) {
      try { await cloudinary.uploader.destroy(user.resume.public_id, { resource_type: "raw" }); } catch (e) { }
    }

    // FIX: Use streamUpload instead of file.path
    const uploadedResume = await streamUpload(resumeFile.buffer, {
      folder: "admin/resumes", resource_type: "raw"
    });

    const updatedUser = await adminModel.findByIdAndUpdate(
      userId,
      { resume: { public_id: uploadedResume.public_id, url: uploadedResume.secure_url } },
      { new: true }
    ).select(safeReturnFields); 

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
     console.error("Resume Upload Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error during upload" });
  }
};

export const updateSocialMedia = async (req, res) => {
  try {
    const userId = req.user._id;
    const { socialMedia } = req.body;
    
    const updatedUser = await adminModel.findByIdAndUpdate(
      userId, { social_media: socialMedia }, { new: true, runValidators: true }
    ).select(safeReturnFields); 

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateReadingResources = async (req, res) => {
  try {
    const userId = req.user._id;
    const { readingResources } = req.body;

    const updatedUser = await adminModel.findByIdAndUpdate(
      userId, { reading_resources: readingResources }, { new: true }
    ).select(safeReturnFields); 

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const updateQuote = async (req, res) => {
  try {
    const userId = req.user._id;
    const { quote } = req.body;

    const updatedUser = await adminModel.findByIdAndUpdate(
      userId, { quote: quote }, { new: true, runValidators: true }
    ).select(safeReturnFields); 

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const updateHobbies = async (req, res) => {
  try {
    const userId = req.user._id;
    const { hobbies } = req.body;

    const updatedUser = await adminModel.findByIdAndUpdate(
      userId, { hobbies }, { new: true }
    ).select(safeReturnFields); 

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const updateBasicInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, user_name } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (user_name) updateFields.user_name = user_name;

    const updatedUser = await adminModel.findByIdAndUpdate(
      userId, updateFields, { new: true, runValidators: true }
    ).select(safeReturnFields); 

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const updateProfileBulk = async(req, res)=> {
  try {
    const userId = req.user._id;
    const updates = req.body;

    const updatedUser = await adminModel.findByIdAndUpdate(
      userId, updates, {new: true, runValidators: true}
    ).select(safeReturnFields);

    return res.status(200).json({ success: true, user: updatedUser });
  }catch(error) {
    return res.status(500).json({ success: false });
  }
}