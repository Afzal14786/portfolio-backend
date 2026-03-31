import { blogModel } from "../../../models/blogs/blog.model.js"
import { likesModel } from '../../../models/likes/likes.model.js';
import { commentModel } from '../../../models/comments/comments.model.js';
import { shareModel } from '../../../models/share/share.model.js';

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete = false } = req.body;
    const blog = await blogModel.findOne({ _id: id, author: req.user._id });

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found'
      });
    }

    if (hardDelete) {
      await Promise.all([
        blogModel.findByIdAndDelete(id),
        commentModel.deleteMany({ blog: id }),
        likesModel.deleteMany({ target: id, targetType: 'blog' }),
        shareModel.deleteMany({ blog: id })
      ]);

      return res.json({
        success: true,
        message: 'Blog permanently deleted'
      });
    } else {
      await blogModel.findByIdAndUpdate(
        id, 
        { status: 'archived' }, 
        { new: true, runValidators: false } 
      );

      return res.json({
        success: true,
        message: 'Blog archived successfully'
      });
    }
  } catch (error) {
    console.error("Blog Delete Error: ", error);
    res.status(500).json({
      success: false,
      error: error.message || 'An internal server error occurred while deleting the blog.'
    });
  }
};