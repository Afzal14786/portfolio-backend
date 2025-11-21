import express from 'express';
import {
  getAllBlogs,
  getBlogBySlug
} from '../../../controllers/blog/index.js';

const router = express.Router();

// ==================== PUBLIC BLOG ROUTES ====================

// Get all published blogs (with filtering, pagination, search)
router.get('/', getAllBlogs);          // GET /blogs?page=1&limit=10&topic=tech&search=query

// Get single blog by slug
router.get('/:slug', getBlogBySlug);   // GET /blogs/my-blog-slug

export default router;