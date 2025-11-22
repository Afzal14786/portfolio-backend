import {shareModel} from '../../models/share/share.model.js';

/**
 * @desc    Track when someone clicks on a shared link
 * @route   POST /api/shares/:shareId/click
 * @access  Public
 * @param   {string} shareId - ID of the share to track
 * @returns {Object} Updated click count
 */
export const trackShareClick = async (req, res) => {
  try {
    const { shareId } = req.params;

    const share = await shareModel.findById(shareId);
    if (!share) {
      return res.status(404).json({
        success: false,
        error: 'Share not found'
      });
    }

    // Track click with additional data
    await share.incrementClicks();

    // Add click analytics data
    share.clicks.push({
      clickedAt: new Date(),
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      referrer: req.get('Referer')
    });

    await share.save();

    res.json({
      success: true,
      data: {
        clickCount: share.clickCount
      },
      message: 'Share click tracked successfully'
    });

  } catch (error) {
    console.error('Track share click error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track share click'
    });
  }
};