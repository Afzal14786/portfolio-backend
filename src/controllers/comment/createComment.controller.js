import {commentModel} from '../../models/comments/comments.model.js';
import {blogModel} from '../../models/blogs/blog.model.js';

/**
 * @desc    Create a new comment or reply on a blog
 * @route   POST /api/comments/blogs/:blogId
 * @access  Private
 * @param   {string} blogId - ID of the blog to comment on
 * @param   {string} content - Comment content
 * @param   {string} parentComment - Parent comment ID for replies (optional)
 * @returns {Object} Created comment with author details
 */
export const createComment = async (req, res) => {
  const session = await commentModel.startSession();
  
  try {
    session.startTransaction();
    
    const { blogId } = req.params;
    const { content, parentComment } = req.body;
    const userId = req.user._id;

    // Input validation
    if (!content || content.trim().length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    if (content.length > 2000) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: 'Comment cannot exceed 2000 characters'
      });
    }

    // Verify blog exists and is published
    const blog = await blogModel.findOne({
      _id: blogId,
      status: 'published'
    }).session(session);

    if (!blog) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: 'Blog not found or not published'
      });
    }

    // Handle nested comments
    let depth = 0;
    if (parentComment) {
      const parent = await commentModel.findById(parentComment).session(session);
      if (!parent) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          error: 'Parent comment not found'
        });
      }
      
      depth = parent.depth + 1;
      if (depth > 5) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          error: 'Maximum reply depth exceeded (5 levels maximum)'
        });
      }
    }

    // Create comment
    const comment = new commentModel({
      blog: blogId,
      author: userId,
      content: content.trim(),
      parentComment: parentComment || null,
      depth,
      status: 'active'
    });

    await comment.save({ session });

    // Update parent comment's replies if it's a reply
    if (parentComment) {
      await commentModel.findByIdAndUpdate(
        parentComment,
        { $push: { replies: comment._id } },
        { session }
      );
    }

    // Populate author info for response
    await comment.populate('author', 'username profile.name profile.avatar');

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: {
        comment,
        message: parentComment ? 'Reply added successfully' : 'Comment added successfully'
      }
    });

  } catch (error) {
    await session.abortTransaction();
    
    console.error('Create comment error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create comment'
    });
  } finally {
    session.endSession();
  }
};