import { blogModel } from "../../../models/blogs/blog.model.js";
import { adminModel } from "../../../models/admin/user.model.js"; // Required for population

export const getPublishedBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, topic, search } = req.query;

    const query = { status: 'published' };

    if (topic && topic !== 'all') query.topic = topic;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const blogs = await blogModel.find(query)
      .populate({ path: 'author', model: adminModel, select: 'name avatar' })
      .select('title slug excerpt coverImage readTime topic tags publishedAt createdAt views')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await blogModel.countDocuments(query);

    res.json({
      success: true,
      data: {
        blogs,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching published blogs for public API:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};