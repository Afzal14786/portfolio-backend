/**
 * Generate UTM parameters for tracking
 * @param {Object} params - UTM parameters
 * @returns {string} Formatted URL parameters
 */
export function generateUTMParams(params) {
  const { source, medium, campaign, term, content } = params;
  const utmParams = new URLSearchParams();
  
  if (source) utmParams.append('utm_source', source);
  if (medium) utmParams.append('utm_medium', medium);
  if (campaign) utmParams.append('utm_campaign', campaign);
  if (term) utmParams.append('utm_term', term);
  if (content) utmParams.append('utm_content', content);
  
  return utmParams.toString() ? `?${utmParams.toString()}` : '';
}

/**
 * Generate short URL for sharing
 * @param {string} shareId - Share ID
 * @returns {string} Short URL
 */
export function generateShortUrl(shareId) {
  return `${process.env.SHORT_URL_DOMAIN || process.env.FRONTEND_URL}/s/${shareId}`;
}