 import {blogModel} from "../../../models/blogs/blog.model.js"
 import {likesModel} from '../../../models/likes/likes.model.js';
 import {commentModel} from '../../../models/comments/comments.model.js';
 import {shareModel} from '../../../models/share/share.model.js';
 import {adminModel} from '../../../models/admin/user.model.js';

 export const getBlogBySlug = async (req, res) => {
   try {
     const { slug } = req.params;
     const authorId = req.user._id;

     const blog = await blogModel.findOne({ 
       slug, 
       author: authorId 
     })
     .populate({ path: 'author', model: adminModel, select: 'name avatar bio socialLinks' });

     if (!blog) {
       return res.status(404).json({ 
         success: false,
         error: 'Blog not found' 
       });
     }

     // Increment views (async)
     blogModel.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec();

     // Get engagement counts and comments
     const [likesCount, commentsCount, sharesCount, comments] = await Promise.all([
       likesModel.countDocuments({ target: blog._id, targetType: 'blog' }),
       commentModel.countDocuments({ blog: blog._id, status: 'active' }),
       shareModel.countDocuments({ blog: blog._id }),
       commentModel.find({ blog: blog._id, parentComment: null, status: 'active' })
         .populate({ path: 'author', model: adminModel, select: 'name avatar' })
         .populate({
           path: 'replies',
           populate: { path: 'author', model: adminModel, select: 'name avatar' }
         })
         .sort({ createdAt: -1 })
         .limit(50)
     ]);

     // Get related blogs (only from the same author)
     const relatedBlogs = await blogModel.find({
       author: authorId,
       topic: blog.topic,
       _id: { $ne: blog._id }
     })
     .limit(3)
     .select('title slug excerpt coverImage readTime publishedAt');

     res.json({
       success: true,
       data: {
         blog: {
           ...blog.toObject(),
           likesCount,
           commentsCount,
           sharesCount
         },
         comments,
         relatedBlogs
       }
     });
   } catch (error) {
     console.error('Error fetching blog by slug:', error);
     res.status(500).json({
       success: false,
       error: error.message
     });
   }
 };