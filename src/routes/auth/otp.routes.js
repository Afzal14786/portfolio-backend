import express from "express";
import wrapAsync from "../../middlewares/wrapErr.js";
import { resendOtpController, checkOtpStatus } from "../../controllers/auth/otp.controller.js";

const router = express.Router();

router.post("/resend", wrapAsync(resendOtpController));
router.get("/status", wrapAsync(checkOtpStatus));

export default router;