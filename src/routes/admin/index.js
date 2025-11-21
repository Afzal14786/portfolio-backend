import express from "express";

// Import sub-routes
import adminAuth from './auth/index.js';
import adminBlogRoutes from './blog/index.route.js';
import adminProfileRoutes from './profile/index.js';
import adminPasswordRoutes from './password/index.js';
import adminEmailRoutes from './email/index.js';

const router = express.Router();

// ==================== ADMIN ROUTES ====================
router.use('/auth', adminAuth);
router.use('/blogs', adminBlogRoutes);
router.use('/profile', adminProfileRoutes);
router.use('/password', adminPasswordRoutes);
router.use('/email', adminEmailRoutes);

// ==================== ADMIN HEALTH CHECK ====================
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✅ Admin API is operational!",
    status: "healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        path: "/admin/auth",
        description: "Admin authentication & authorization",
        methods: ["POST"]
      },
      blogs: {
        path: "/admin/blogs",
        description: "Blog management & content creation",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
      },
      profile: {
        path: "/admin/profile",
        description: "Admin profile management",
        methods: ["GET", "PATCH", "POST"]
      },
      password: {
        path: "/admin/password",
        description: "Password management & security",
        methods: ["POST"]
      },
      email: {
        path: "/admin/email",
        description: "Email update & verification",
        methods: ["POST"]
      }
    },
    authentication: "Required for all endpoints except /admin/auth",
    rateLimiting: "Enabled for all endpoints",
    version: "1.0.0"
  });
});

export default router;