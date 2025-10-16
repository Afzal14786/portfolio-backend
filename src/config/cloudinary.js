// src/config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config({quite: true});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET_KEY,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // detect if it's a PDF 
    const isPdf = file.mimetype === "application/pdf";

    return {
      folder: "portfolio",
      resource_type: isPdf ? "raw" : "image",
      format: isPdf ? "pdf" : "webp",
      allowed_formats: ["png", "jpeg", "jpg", "webp", "pdf"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

export { cloudinary, storage };
