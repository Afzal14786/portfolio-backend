import express from "express";
import resetRoutes from "./reset.route.js";
import updateRoutes from "./update.route.js";

const router = express.Router();

// ==================== PASSWORD ROUTES ====================
router.use("/reset", resetRoutes);    // authentication not required
router.use("/update", updateRoutes);  // Auth required - logged-in update

// ==================== PASSWORD HEALTH CHECK ====================
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🔒 Admin Password Management API is operational!",
    status: "healthy",
    timestamp: new Date().toISOString(),
    security: {
      reset: "OTP verification via email (no auth required)",
      update: "OTP verification for logged-in users (auth required)"
    },
    endpoints: {
      reset: {
        "POST /admin/password/reset/": {
          description: "Forgot password OTP request (no authentication)",
          parameters: {
            "email": "string (registered admin email)"
          }
        },
        "POST /admin/password/reset/verify-otp": {
          description: "Verify reset OTP (no authentication)",
          parameters: {
            "email": "string",
            "otp": "string (6-digit code)",
            "newPassword": "string (min 8 characters)"
          }
        }
      },
      update: {
        "POST /admin/password/update/": {
          description: "Logged-in password update OTP request (authentication required)",
          authentication: "Bearer token required"
        },
        "POST /admin/password/update/verify-otp": {
          description: "Verify update OTP and change password (authentication required)",
          parameters: {
            "otp": "string (6-digit code)",
            "newPassword": "string (min 8 characters)"
          }
        }
      }
    },
    passwordRequirements: {
      minLength: 8,
      requirements: "At least one uppercase, one lowercase, one number"
    }
  });
});

export default router;