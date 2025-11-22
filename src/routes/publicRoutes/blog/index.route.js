import express from "express";
const router = express.Router();

import { protect } from "../../../middlewares/middleware.auth.js";
import { optionalAuth } from "../../../middlewares/optionalAuth.js";

// blog controllers
import { 
  getAllBlogs, 
  getBlogBySlug 
} from "../../../controllers/blog/index.js";

// comment controllers
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
  reportComment,
  getCommentReplies
} from "../../../controllers/comment/index.js";

// share controllers
import {
  createShare,
  getShares,
  trackShareClick
} from "../../../controllers/share/index.js";

// like controllers
import {
  toggleLike,
  getLikes,
  getUserLikes
} from "../../../controllers/like/index.js";

/**
 * Public User Blog Routes
 * - Unauthenticated users can view blogs and shares
 * - Authenticated users can like, comment, and manage their interactions
 */

// ==================== BLOG VIEWING ROUTES (PUBLIC) ====================

// Get all published blogs (no auth required)
router.get("/", getAllBlogs);                    // GET /blogs

// Get blog by slug (no auth required)
router.get("/:slug", getBlogBySlug);             // GET /blogs/:slug

// ==================== BLOG COMMENTS ROUTES ====================

// Get comments for a blog (public - no auth required)
router.get("/:blogId/comments", getComments);    // GET /blogs/:blogId/comments

// Get comment replies (public - no auth required)
router.get("/comments/:commentId/replies", getCommentReplies); // GET /blogs/comments/:commentId/replies

// Create comment (authenticated users only)
router.post("/:blogId/comments", protect, createComment); // POST /blogs/:blogId/comments

// Update comment (authenticated users - only their own comments)
router.put("/comments/:commentId", protect, updateComment); // PUT /blogs/comments/:commentId

// Delete comment (authenticated users - only their own comments)
router.delete("/comments/:commentId", protect, deleteComment); // DELETE /blogs/comments/:commentId

// Like a comment (authenticated users only)
router.post("/comments/:commentId/like", protect, likeComment); // POST /blogs/comments/:commentId/like

// Report a comment (authenticated users only)
router.post("/comments/:commentId/report", protect, reportComment); // POST /blogs/comments/:commentId/report

// ==================== BLOG LIKES ROUTES ====================

// Toggle like on blog (authenticated users only)
router.post("/:blogId/like", protect, toggleLike); // POST /blogs/:blogId/like

// Get likes for a blog (public - no auth required)
router.get("/:blogId/likes", getLikes);          // GET /blogs/:blogId/likes

// Get user's likes (authenticated users only)
router.get("/user/likes", protect, getUserLikes); // GET /blogs/user/likes

// ==================== BLOG SHARES ROUTES ====================

// Create share (no auth required - but track if user is authenticated)
router.post("/:blogId/share", optionalAuth, createShare); // POST /blogs/:blogId/share

// Get shares for a blog (public - no auth required)
router.get("/:blogId/shares", getShares);        // GET /blogs/:blogId/shares

// Track share click (no auth required)
router.post("/shares/:shareId/track", trackShareClick); // POST /blogs/shares/:shareId/track

// ==================== HEALTH CHECK ====================
router.get("/health/status", (req, res) => {
  res.json({
    success: true,
    message: "📖 Public Blog Routes API is operational!",
    status: "healthy",
    timestamp: new Date().toISOString(),
    features: {
      blogViewing: "Read published blogs with rich content",
      comments: "Comment system with moderation and replies",
      interactions: "Like and share functionality",
      userEngagement: "Authenticated user interactions"
    },
    endpoints: {
      publicAccess: {
        "GET /blogs": "Get all published blogs",
        "GET /blogs/:slug": "Get specific blog by slug",
        "GET /blogs/:blogId/comments": "Get comments for a blog",
        "GET /blogs/:blogId/likes": "Get likes for a blog",
        "GET /blogs/:blogId/shares": "Get shares for a blog",
        "GET /blogs/comments/:commentId/replies": "Get comment replies",
        "POST /blogs/:blogId/share": "Share a blog (auth optional)",
        "POST /blogs/shares/:shareId/track": "Track share click"
      },
      authenticatedAccess: {
        "POST /blogs/:blogId/comments": "Add comment to blog",
        "PUT /blogs/comments/:commentId": "Update own comment",
        "DELETE /blogs/comments/:commentId": "Delete own comment",
        "POST /blogs/comments/:commentId/like": "Like a comment",
        "POST /blogs/comments/:commentId/report": "Report a comment",
        "POST /blogs/:blogId/like": "Toggle like on blog",
        "GET /blogs/user/likes": "Get user's liked blogs"
      }
    },
    authentication: {
      public: "Not required for viewing",
      interactions: "Required for comments, likes, and managing own content"
    }
  });
});

export default router;