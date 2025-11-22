import {shareModel} from '../../models/share/share.model.js';
import {blogModel} from '../../models/blogs/blog.model.js';
import { generateUTMParams } from '../../utils/urlUtils.js';

/**
 * @desc    Create a share record and generate share URLs
 * @route   POST /api/shares/blogs/:blogId
 * @access  Private
 * @param   {string} blogId - ID of the blog to share
 * @param   {string} platform - Sharing platform
 * @param   {string} customMessage - Custom share message (optional)
 * @param   {string} referralSource - Referral source (optional)
 * @returns {Object} Share record with platform-specific URLs
 */
export const createShare = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { 
      platform, 
      customMessage, 
      referralSource,
      utmSource,
      utmMedium = 'social',
      utmCampaign = 'share'
    } = req.body;

    // Validate platform
    const validPlatforms = ['twitter', 'linkedin', 'facebook', 'reddit', 'whatsapp', 'telegram', 'other'];
    if (!platform || !validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`
      });
    }

    // Check if blog exists and is published
    const blog = await blogModel.findOne({
      _id: blogId,
      status: 'published'
    }).populate('author', 'username profile.name');

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: 'Blog not found or not published'
      });
    }

    // Generate share URL with UTM parameters
    const baseUrl = `${process.env.FRONTEND_URL}/blogs/${blog.slug}`;
    const utmParams = generateUTMParams({
      source: utmSource || platform,
      medium: utmMedium,
      campaign: utmCampaign,
      term: blog._id.toString(),
      content: `share_${platform}`
    });

    const sharedUrl = `${baseUrl}${utmParams}`;

    // Create share record
    const share = new shareModel({
      user: req.user._id,
      blog: blogId,
      platform,
      sharedUrl,
      customMessage: customMessage?.substring(0, 280), // Twitter limit
      referralSource,
      utmSource: utmSource || platform,
      utmMedium,
      utmCampaign,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });

    await share.save();

    // Generate platform-specific share URLs
    const shareUrls = generatePlatformShareUrls(platform, sharedUrl, {
      title: blog.title,
      message: customMessage,
      author: blog.author.profile?.name || blog.author.username
    });

    res.status(201).json({
      success: true,
      data: {
        share: {
          ...share.toObject(),
          shareUrls
        },
        blog: {
          title: blog.title,
          slug: blog.slug,
          author: blog.author
        }
      },
      message: 'Blog shared successfully'
    });

  } catch (error) {
    console.error('Create share error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create share'
    });
  }
};

// Helper function to generate platform-specific share URLs
function generatePlatformShareUrls(platform, url, content) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(content.title);
  const encodedMessage = encodeURIComponent(
    content.message || `Check out this blog: "${content.title}" by ${content.author}`
  );

  const urls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedMessage}%0A%0A${encodedUrl}`
  };

  return {
    direct: url,
    platform: urls[platform] || url
  };
}