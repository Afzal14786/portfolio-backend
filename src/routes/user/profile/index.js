import express from "express";
import profileRoutes from "./profile.routes.js";

const router = express.Router();

// ==================== PROFILE ROUTES ====================
router.use("/", profileRoutes); // All routes are in profile.routes.js

// ==================== PROFILE HEALTH CHECK ====================
router.get("/", (req, res) => {
  res.json({
    message: "Profile API is working!",
    endpoints: {
      "PUT /name": "Update name (auth required)",
      "POST /image": "Upload profile image (auth required)",
      "POST /banner": "Upload banner image (auth required)", 
      "POST /resume": "Upload resume (auth required)"
    }
  });
});

export default router;