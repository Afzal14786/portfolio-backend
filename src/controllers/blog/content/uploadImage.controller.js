import { blogModel } from "../../../models/blogs/blog.model.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from 'streamifier'; 

const streamUpload = (fileBuffer, options) => {
    return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (result) resolve(result);
                else reject(error);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: 0, error: "No image file provided" });
        }

        const uploadOptions = {
            folder: "admin/blogs/content",
            resource_type: "auto",
        };

        const result = await streamUpload(req.file.buffer, uploadOptions);

        const { blogId } = req.params;
        if (blogId && blogId !== 'undefined' && blogId !== 'null') {
            await blogModel.findByIdAndUpdate(blogId, {
                $push: {
                    images: {
                        url: result.secure_url,
                        cloudinaryId: result.public_id, 
                        alt: req.body.alt || "Blog content image",
                        caption: req.body.caption || ""
                    }
                }
            });
        }

        return res.status(200).json({
            success: 1, 
            message: "Image uploaded successfully",
            url: result.secure_url, 
            cloudinaryId: result.public_id, 
            data: {
                url: result.secure_url 
            }
        });

    } catch (error) {
        console.error("Blog Image Upload Error:", error);
        return res.status(500).json({ success: 0, error: error.message || "Server Error" });
    }
};