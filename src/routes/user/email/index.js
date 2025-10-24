import express from "express";
import emailRoutes from "./email.routes.js";

const router = express.Router();

// ==================== EMAIL ROUTES ====================
router.use("/", emailRoutes); // All routes are in email.routes.js

// ==================== EMAIL HEALTH CHECK ====================
router.get("/", (req, res) => {
  res.json({
    message: "Email API is working!",
    endpoints: {
      "POST /request-update": "Request email update OTP (auth required)",
      "POST /verify-otp": "Verify email update OTP (auth required)"
    }
  });
});

export default router;