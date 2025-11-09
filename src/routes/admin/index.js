import express from "express";

// Import sub-routes
import passwordRoutes from "./password/index.js";
import profileRoutes from "./profile/index.js";
import emailRoutes from "./email/index.js";

const router = express.Router();

// ==================== USER ROUTES ====================
router.use("/password", passwordRoutes);
router.use("/profile", profileRoutes);
router.use("/email", emailRoutes);

// ==================== USER HEALTH CHECK ====================
router.get("/", (req, res) => {
  res.json({
    message: "User API is working!",
    endpoints: {
      password: "/admin/password",
      profile: "/admin/profile", 
      email: "/admin/email"
    }
  });
});

export default router;