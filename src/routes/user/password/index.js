import express from "express";
import resetRoutes from "./reset.routes.js";
import updateRoutes from "./update.routes.js";

const router = express.Router();

// ==================== PASSWORD ROUTES ====================
router.use("/reset", resetRoutes);    // authentication not required
router.use("/update", updateRoutes);  // Auth required - logged-in update

// ==================== PASSWORD HEALTH CHECK ====================
router.get("/", (req, res) => {
  res.json({
    message: "Password API is working!",
    endpoints: {
      reset: {
        "POST /request": "Forgot password OTP request (no auth)",
        "POST /verify-otp": "Verify reset OTP (no auth)", 
        "POST /update": "Update password after verification (no auth)"
      },
      update: {
        "POST /request": "Logged-in password update OTP request (auth)",
        "POST /verify-otp": "Verify update OTP (auth)"
      }
    }
  });
});

export default router;