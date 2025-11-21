import express from "express";
import emailRoutes from "./email.route.js";

const router = express.Router();

// ==================== EMAIL ROUTES ====================
router.use("/", emailRoutes); // All routes are in email.routes.js

// ==================== EMAIL HEALTH CHECK ====================
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "📧 Admin Email Management API is operational!",
    status: "healthy",
    timestamp: new Date().toISOString(),
    security: "OTP verification required for all email changes",
    endpoints: {
      "POST /admin/email/request-update": {
        description: "Request email update OTP",
        authentication: "Required",
        parameters: {
          "newEmail": "string (valid email format)"
        }
      },
      "POST /admin/email/verify-otp": {
        description: "Verify email update OTP and update email",
        authentication: "Required",
        parameters: {
          "newEmail": "string",
          "otp": "string (6-digit code)"
        }
      }
    },
    flow: "Request OTP → Check email → Verify OTP → Email updated",
    note: "OTP expires in 10 minutes. Check spam folder if email not received."
  });
});

export default router;