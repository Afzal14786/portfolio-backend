import express from 'express';
import { protect } from '../../../middlewares/middleware.auth.js';
import upload from '../../../middlewares/upload.js';

// Import blog controllers
import {
  createBlog,
  createDraft,
  autoSaveDraft,
  getUserBlogs,
  getBlogById,
  updateBlog,
  updateBlogStatus,
  deleteBlog,
  uploadImage
} from '../../../controllers/blog/index.js';

// Import analytics controllers
import {
  getDashboardStats,
  getBlogAnalytics
} from '../../../controllers/analytics/index.js';

const router = express.Router();

// Apply authentication middleware to all admin blog routes
router.use(protect);

// ==================== BLOG MANAGEMENT ROUTES ====================

// Blog CRUD operations
router.get('/', getUserBlogs);                    // GET /admin/blogs - Get user's blogs
router.get('/stats', getDashboardStats);          // GET /admin/blogs/stats - Dashboard statistics
router.get('/analytics/:blogId', getBlogAnalytics); // GET /admin/blogs/analytics/:blogId - Blog analytics
router.get('/:id', getBlogById);                  // GET /admin/blogs/:id - Get blog by ID for editing
router.post('/', createBlog);                     // POST /admin/blogs - Create new blog
router.post('/draft', createDraft);               // POST /admin/blogs/draft - Create draft
router.post('/:blogId/auto-save', autoSaveDraft); // POST /admin/blogs/:blogId/auto-save - Auto-save draft
router.put('/:id', updateBlog);                   // PUT /admin/blogs/:id - Update blog
router.patch('/:id/status', updateBlogStatus);    // PATCH /admin/blogs/:id/status - Update blog status
router.delete('/:id', deleteBlog);                // DELETE /admin/blogs/:id - Delete blog

// Content management
router.post('/:blogId/images', upload.single('image'), uploadImage); // POST /admin/blogs/:blogId/images - Upload image

// ==================== BLOG API HEALTH CHECK ====================
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "📝 Admin Blog Management API is operational!",
    status: "healthy",
    timestamp: new Date().toISOString(),
    features: {
      contentManagement: "Rich text editor with image upload",
      autoSave: "Real-time draft auto-saving",
      analytics: "Detailed blog performance metrics",
      scheduling: "Future publish scheduling"
    },
    endpoints: {
      analytics: {
        "GET /admin/blogs/stats": "Get dashboard statistics and overview",
        "GET /admin/blogs/analytics/:blogId": "Get detailed analytics for specific blog"
      },
      blogManagement: {
        "GET /admin/blogs": "Get all admin's blogs with pagination",
        "GET /admin/blogs/:id": "Get specific blog by ID for editing",
        "POST /admin/blogs": "Create new blog",
        "POST /admin/blogs/draft": "Create draft blog",
        "POST /admin/blogs/:blogId/auto-save": "Auto-save draft content",
        "PUT /admin/blogs/:id": "Update blog content and metadata",
        "PATCH /admin/blogs/:id/status": "Update blog status (draft/published/scheduled)",
        "DELETE /admin/blogs/:id": "Delete blog (soft/hard delete)"
      },
      content: {
        "POST /admin/blogs/:blogId/images": "Upload image for blog content"
      }
    },
    authentication: "Required - JWT token in Authorization header",
    fileUpload: {
      supportedFormats: "JPEG, PNG, WebP, GIF",
      maxSize: "5MB",
      optimization: "Automatic WebP conversion"
    }
  });
});

export default router;