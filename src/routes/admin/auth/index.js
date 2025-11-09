import express from "express";
import loginRoutes from "./login.route.js";
import registerRoutes from "./register.route.js";
import otpRoutes from "./Otp.route.js";
import registrationOtpRoutes from "./registrationOtp.route.js";

const router = express.Router();

// ==================== AUTH ROUTES ====================
router.use("/registration-otp", registrationOtpRoutes); // for non-authorized persons
router.use("/login", loginRoutes);
router.use("/register", registerRoutes);
router.use("/otp", otpRoutes); // for only authorized persons

// ==================== AUTH HEALTH CHECK ====================
router.get("/", (req, res) => {
  res.json({
    message: "Admin Auth API is working!",
    endpoints: {
      login: {
        "POST /": "Admin Login request",
        "POST /verify": "Verify admin login OTP", 
      },
      register: {
        "POST /": "Admin Register request",
        "POST /verify-otp": "Verify admin registration OTP"
      },
      otp: {
        "POST /resend": "Resend OTP for logged-in admins",
        "GET /status": "Check OTP status for logged-in admins"
      },
      "registration-otp": {
        "POST /resend": "Resend admin registration OTP (no auth required)",
        "GET /status": "Check admin registration OTP status (no auth required)"
      }
    }
  });
});

export default router;