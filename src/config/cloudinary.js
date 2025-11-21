import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Use consistent naming
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Cloudinary folder
 * @param {string} resourceType - 'image', 'raw', 'auto'
 * @returns {Promise} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder = "portfolio", resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'doc', 'docx'],
        format: 'webp', // Auto-convert images to WebP
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    uploadStream.end(buffer);
  });
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - 'image', 'raw'
 * @returns {Promise} Cloudinary delete result
 */
const deleteFromCloudinary = (publicId, resourceType = "image") => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType
  });
};

export { cloudinary, uploadToCloudinary, deleteFromCloudinary };