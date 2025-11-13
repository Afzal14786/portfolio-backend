import express from "express";
import multer from "multer";
import { storage } from "../../../config/cloudinary.js";
import wrapAsync from "../../../middlewares/wrapErr.js";
import { protect } from "../../../middlewares/middleware.auth.js";
import { 
  updateProfileImage, 
  updateBannerImage, 
  updateResume,
  updateSocialMedia,
  updateReadingResources,
  updateQuote,
  updateHobbies,
  updateBasicInfo,
  updateProfileBulk
} from "../../../controllers/admin/profile/update/updateProfile.controller.js";

const router = express.Router();

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    // allow images and PDFs only
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'), false);
    }
  }
});

router.use(protect);

router.patch("/image", upload.single("profile_image"), wrapAsync(updateProfileImage));    // Profile image
router.patch("/banner", upload.single("banner_image"), wrapAsync(updateBannerImage));     // Banner image
router.patch("/resume", upload.single("resume"), wrapAsync(updateResume));                // Resume

router.patch("/social-media", wrapAsync(updateSocialMedia));          // Social media links
router.patch("/reading-resources", wrapAsync(updateReadingResources)); // Reading resources
router.patch("/quote", wrapAsync(updateQuote));                       // Quote
router.patch("/hobbies", wrapAsync(updateHobbies));                   // Hobbies
router.patch("/basic-info", wrapAsync(updateBasicInfo));              // Name & username
router.patch("/bulk-update", wrapAsync(updateProfileBulk));

export default router;