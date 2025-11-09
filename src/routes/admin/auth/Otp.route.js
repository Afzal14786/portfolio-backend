import express from "express";
import wrapAsync from "../../../middlewares/wrapErr.js";
import { protect, requireAdmin } from "../../../middlewares/middleware.auth.js";
import { resendOtpController, checkOtpStatus } from "../../../controllers/otp/otp.controller.js";

const router = express.Router();

router.use(protect, requireAdmin);

router.post("/resend", wrapAsync((req, res) => {
  req.body.userType = 'admin';
  req.body.email = req.user.email;
  return resendOtpController(req, res);
}));

router.get("/status", wrapAsync((req, res) => {
  req.query.userType = 'admin';
  req.query.email = req.user.email;
  return checkOtpStatus(req, res);
}));

export default router;