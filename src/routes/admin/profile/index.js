import express from "express";
import updateProfileRoute from "./updateProfile.route.js";
import getProfileInfo from "./getProfile.route.js";

const router = express.Router();

// ==================== PROFILE ROUTES ====================
router.use("/update", updateProfileRoute); // All routes are in profile.routes.js
router.use("/info", getProfileInfo);

// ==================== PROFILE HEALTH CHECK ====================
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "👤 Admin Profile Management API is operational!",
    status: "healthy",
    timestamp: new Date().toISOString(),
    features: {
      fileUpload: "Image and document upload with validation",
      socialMedia: "Multiple platform social links",
      bulkUpdates: "Update multiple fields in one request"
    },
    endpoints: {
      fileUpload: {
        "PATCH /admin/profile/update/image": "Update profile image (auth required)",
        "PATCH /admin/profile/update/banner": "Upload banner image (auth required)", 
        "PATCH /admin/profile/update/resume": "Upload resume (auth required)"
      },
      dataUpdates: {
        "PATCH /admin/profile/update/social-media": "Update social media links",
        "PATCH /admin/profile/update/reading-resources": "Update reading resources",
        "PATCH /admin/profile/update/quote": "Update personal quote",
        "PATCH /admin/profile/update/hobbies": "Update hobbies and interests",
        "PATCH /admin/profile/update/basic-info": "Update name & username",
        "PATCH /admin/profile/update/bulk-update": "Bulk update multiple fields"
      },
      profileInfo: {
        "GET /admin/profile/info": "Get complete admin profile information"
      }
    },
    fileUploadSpecs: {
      profileImage: {
        formats: "JPEG, PNG, WebP, GIF",
        maxSize: "5MB",
        aspectRatio: "1:1 recommended"
      },
      bannerImage: {
        formats: "JPEG, PNG, WebP, GIF", 
        maxSize: "5MB",
        aspectRatio: "16:9 recommended"
      },
      resume: {
        formats: "PDF, DOC, DOCX",
        maxSize: "5MB"
      }
    },
    authentication: "Required for all endpoints - JWT token"
  });
});

export default router;