import express from "express";
import multer from "multer";
import { storage } from "../../../config/cloudinary.js";
import wrapAsync from "../../../middlewares/wrapErr.js";
import { protect } from "../../../middlewares/middleware.auth.js";
import { 
  updateName,
  updateProfileImage, 
  updateBannerImage, 
  updateResume 
} from "../../../controllers/admin/profile/update/update.user.controller.js";

const router = express.Router();
const upload = multer({ storage });

// All routes require authentication
router.use(protect);

// Profile updates
router.put("/name", wrapAsync(updateName));                                  // Update name
router.post("/image", upload.single("profile_image"), wrapAsync(updateProfileImage));    // Profile image
router.post("/banner", upload.single("banner_image"), wrapAsync(updateBannerImage));     // Banner image
router.post("/resume", upload.single("resume"), wrapAsync(updateResume));                // Resume

export default router;