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
        allowed_formats: ["png", "jpeg", "jpg", "webp"]
    }

});

export {
    cloudinary,
    storage
};