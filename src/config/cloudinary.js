import {v2 as cloudinary} from "cloudinary"
import {CloudinaryStorage} from "multer-storage-cloudinary"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET_KEY
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "portfolio",
        resource_type: isPdf ? "raw" : "image",
        allowed_formats: ["png", "jpeg", "jpg", "webp", "pdf"]
    }

});

export {
    cloudinary,
    storage
};