import {blogModel} from '../../../models/blogs/blog.model.js';
import {cloudinary} from '../../../config/cloudinary.js';

export const uploadImage = async (req, res) => {
  try {
    const { blogId } = req.params;
    const imageFile = req.file;
    
    if (!imageFile) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageFile.path, {
      folder: 'blog-images',
      format: 'webp',
      quality: 'auto'
    });

    const imageData = {
      cloudinaryId: result.public_id,
      url: result.secure_url,
      uploadedAt: new Date()
    };

    // If blog exists, add to images array
    if (blogId) {
      await blogModel.findByIdAndUpdate(blogId, {
        $push: { images: imageData }
      });
    }

    res.json({
      success: true,
      data: imageData,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};