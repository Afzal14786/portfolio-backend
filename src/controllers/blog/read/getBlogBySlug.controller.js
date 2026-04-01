import { blogModel } from "../../../models/blogs/blog.model.js";
import { adminModel } from "../../../models/admin/user.model.js";

export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await blogModel.findOne({ slug, status: 'published' })
      .populate({ path: 'author', model: adminModel, select: 'name avatar bio socialLinks' });

    if (!blog) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }

    blogModel.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec();

    const relatedBlogs = await blogModel.find({
      author: blog.author._id,
      topic: blog.topic,
      status: 'published',
      _id: { $ne: blog._id }
    })
    .limit(3)
    .select('title slug excerpt coverImage readTime publishedAt');

    res.json({
      success: true,
      data: {
        blog: blog.toObject(),
        relatedBlogs
      }
    });
  } catch (error) {
    console.error('Error fetching blog by slug for public API:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};