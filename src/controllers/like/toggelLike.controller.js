import {likesModel} from '../../models/likes/likes.model.js';
import {blogModel} from '../../models/blogs/blog.model.js';
import {commentModel} from '../../models/comments/comments.model.js';

/**
 * @desc    Toggle like on blog or comment
 * @route   POST /api/likes/:targetType/:targetId
 * @access  Private
 * @param   {string} targetType - Type of target: 'blog' or 'comment'
 * @param   {string} targetId - ID of the target to like/unlike
 * @param   {string} intensity - Like intensity: 'like', 'love', etc. (optional)
 * @returns {Object} Updated like status and count
 */
export const toggleLike = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { intensity = 'like' } = req.body;

    // Validate target type
    const validTargetTypes = ['blog', 'comment'];
    if (!validTargetTypes.includes(targetType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid target type. Must be one of: ${validTargetTypes.join(', ')}`
      });
    }

    // Validate intensity
    const validIntensities = ['like', 'love', 'insightful', 'helpful', 'curious'];
    if (!validIntensities.includes(intensity)) {
      return res.status(400).json({
        success: false,
        error: `Invalid intensity. Must be one of: ${validIntensities.join(', ')}`
      });
    }

    // Check if target exists and is accessible
    let target;
    const TargetModel = targetType === 'blog' ? blogModel : commentModel;
    
    target = await TargetModel.findOne({
      _id: targetId,
      ...(targetType === 'blog' ? { status: 'published' } : { status: 'active' })
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        error: `${targetType.charAt(0).toUpperCase() + targetType.slice(1)} not found`
      });
    }

    // Toggle like using static method
    const result = await likesModel.toggleLike({
      userId: req.user._id,
      targetId: targetId,
      targetType: targetType,
      intensity
    });

    // Get updated target with like count
    const updatedTarget = await TargetModel.findById(targetId).select('likesCount');

    res.json({
      success: true,
      data: {
        hasLiked: result.hasLiked,
        likesCount: updatedTarget.likesCount,
        intensity: result.hasLiked ? intensity : null,
        action: result.action
      },
      message: result.hasLiked 
        ? `${targetType} liked successfully` 
        : `${targetType} unliked successfully`
    });

  } catch (error) {
    console.error('Toggle like error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'You have already liked this content'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to toggle like'
    });
  }
};