import express from "express";
import loginRoutes from "./login.routes.js";
import registerRoutes from "./register.routes.js";
import otpRoutes from "./otp.routes.js";

const router = express.Router();

// ==================== AUTH ROUTES ====================
router.use("/login", loginRoutes);
router.use("/register", registerRoutes);
router.use("/otp", otpRoutes);

// ==================== AUTH HEALTH CHECK ====================
router.get("/", (req, res) => {
  res.json({
    message: "Auth API is working!",
    endpoints: {
      login: {
        "POST /": "Login request",
        "POST /verify": "Verify login OTP", 
      },
      register: {
        "POST /": "Register request",
        "POST /verify-otp": "Verify registration OTP"
      },
      otp: {
        "POST /resend": "Resend OTP for any type",
        "GET /status": "Check if OTP exists for email/type"
      }
    }
  });
});

export default router;