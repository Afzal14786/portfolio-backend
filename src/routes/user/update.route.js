import express from "express";
import {
  requestPasswordUpdate,
  verifyPasswordOtpAndUpdate,
} from "../../controllers/user/update.password.controller.js";

const router = express.Router();
router.post("/update-password", requestPasswordUpdate);
router.post("/update-password/verify-otp", verifyPasswordOtpAndUpdate);

export default router;
