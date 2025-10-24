const PLATFORM_NAME = "TerminalX";
const BRAND_COLOR_PRIMARY = "#0066ff";
const BRAND_COLOR_SECONDARY = "#00e0ff";
const SUPPORT_EMAIL = "support@terminalx.com";
const DASHBOARD_URL = process.env.DASHBOARD_URL || "https://terminalx.com";

export class BaseTemplate {
  /**
   * complete email template
   */
  static generate({
    title,
    subtitle,
    userName,
    headerColor = `linear-gradient(135deg, ${BRAND_COLOR_PRIMARY}, ${BRAND_COLOR_SECONDARY})`,
    headerIcon = "🔐",
    content,
    securityNotice,
    noticeType = "info",
    showFooter = true,
    showSupportLink = true
  }) {
    const noticeStyles = {
      info: { 
        bg: "#ebf8ff", 
        border: "#90cdf4", 
        text: "#2c5282",
        icon: "🔒"
      },
      warning: { 
        bg: "#fef5e7", 
        border: "#fbd38d", 
        text: "#744210",
        icon: "⚠️"
      },
      error: { 
        bg: "#fed7d7", 
        border: "#feb2b2", 
        text: "#742a2a",
        icon: "🚨"
      },
      success: {
        bg: "#f0fff4",
        border: "#9ae6b4",
        text: "#2f855a",
        icon: "✅"
      }
    };

    const noticeStyle = noticeStyles[noticeType] || noticeStyles.info;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ${PLATFORM_NAME}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8fafc;
      padding: 40px 0;
      text-align: center;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .header {
      background: ${headerColor};
      padding: 40px 0;
      text-align: center;
    }
    
    .header-icon {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    
    .header-title {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }
    
    .header-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 8px 0 0 0;
    }
    
    .content {
      padding: 48px 40px;
    }
    
    .otp-section {
      background: linear-gradient(135deg, #f7fafc, #edf2f7);
      border: 2px dashed #e2e8f0;
      border-radius: 16px;
      padding: 32px;
      margin: 32px 0;
      text-align: center;
    }
    
    .otp-label {
      color: #4a5568;
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 16px 0;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .otp-code {
      display: inline-block;
      padding: 20px 40px;
      background: white;
      border: 2px solid ${BRAND_COLOR_PRIMARY};
      border-radius: 12px;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: ${BRAND_COLOR_PRIMARY};
      font-family: 'Courier New', monospace;
      box-shadow: 0 8px 20px rgba(0, 102, 255, 0.15);
    }
    
    .expiry-notice {
      color: #e53e3e;
      font-size: 14px;
      font-weight: 600;
      margin: 20px 0 0 0;
    }
    
    .security-notice {
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    
    .notice-icon {
      font-size: 18px;
      flex-shrink: 0;
    }
    
    .notice-title {
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }
    
    .notice-content {
      font-size: 14px;
      margin: 0;
      line-height: 1.4;
    }
    
    .cta-button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, ${BRAND_COLOR_PRIMARY}, ${BRAND_COLOR_SECONDARY});
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.5px;
      box-shadow: 0 8px 25px rgba(0, 102, 255, 0.3);
      transition: all 0.3s ease;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(0, 102, 255, 0.4);
    }
    
    .footer {
      background: #f7fafc;
      padding: 24px 40px;
      border-top: 1px solid #e2e8f0;
    }
    
    .footer-text {
      color: #718096;
      font-size: 14px;
      margin: 0 0 8px 0;
      font-weight: 600;
    }
    
    .footer-copyright {
      color: #a0aec0;
      font-size: 12px;
      margin: 0;
    }
    
    .support-link {
      color: ${BRAND_COLOR_PRIMARY};
      text-decoration: none;
      font-weight: 600;
    }
    
    .support-link:hover {
      text-decoration: underline;
    }
    
    /* Responsive design */
    @media (max-width: 640px) {
      body {
        padding: 20px 0;
      }
      
      .content {
        padding: 32px 24px;
      }
      
      .header {
        padding: 32px 0;
      }
      
      .header-title {
        font-size: 24px;
      }
      
      .header-subtitle {
        font-size: 14px;
      }
      
      .otp-code {
        font-size: 28px;
        padding: 16px 32px;
        letter-spacing: 6px;
      }
      
      .footer {
        padding: 20px 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header Section -->
    <div class="header">
      <div class="header-icon">
        <div style="color: white; font-size: 32px; font-weight: bold;">${headerIcon}</div>
      </div>
      <h1 class="header-title">${title}</h1>
      <p class="header-subtitle">${subtitle}</p>
    </div>

    <!-- Content Section -->
    <div class="content">
      ${content}

      ${securityNotice ? `
      <!-- Security Notice -->
      <div class="security-notice" style="background: ${noticeStyle.bg}; border: 1px solid ${noticeStyle.border};">
        <div class="notice-icon" style="color: ${noticeStyle.text};">${noticeStyle.icon}</div>
        <div>
          <p class="notice-title" style="color: ${noticeStyle.text};">Security Notice</p>
          <p class="notice-content" style="color: ${noticeStyle.text};">${securityNotice}</p>
        </div>
      </div>
      ` : ''}

      ${showSupportLink ? `
      <!-- Support Link -->
      <div style="text-align: left; margin-top: 24px;">
        <p style="color: #718096; font-size: 14px; margin: 0;">
          Need help? <a href="mailto:${SUPPORT_EMAIL}" class="support-link">Contact our support team</a>.
        </p>
      </div>
      ` : ''}
    </div>

    ${showFooter ? `
    <!-- Footer -->
    <div class="footer">
      <div style="text-align: center;">
        <p class="footer-text">${PLATFORM_NAME}</p>
        <p class="footer-copyright">
          © ${new Date().getFullYear()} ${PLATFORM_NAME}. All rights reserved.
        </p>
      </div>
    </div>
    ` : ''}
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate OTP section
   */
  static OTPSection(otp, label, color = BRAND_COLOR_PRIMARY, expiry = "10 minutes") {
    return `
<div class="otp-section">
  <p class="otp-label">${label}</p>
  <div class="otp-code" style="border-color: ${color}; color: ${color}; box-shadow: 0 8px 20px ${color}26;">
    ${otp}
  </div>
  <p class="expiry-notice">
    ⏰ Expires in ${expiry}
  </p>
</div>
    `;
  }

  /**
   * Generate CTA button
   */
  static CTAButton(text, url, color = BRAND_COLOR_PRIMARY) {
    return `
<a href="${url}" class="cta-button" style="background: linear-gradient(135deg, ${color}, ${BRAND_COLOR_SECONDARY});">
  ${text}
</a>
    `;
  }

  /**
   * Generate feature list
   */
  static FeatureList(features, icon = "✅") {
    return `
<div style="background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 12px; padding: 24px; margin: 32px 0;">
  <h3 style="color: #2f855a; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">What's Next?</h3>
  <div style="display: grid; gap: 12px;">
    ${features.map(feature => `
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="color: #38a169; font-size: 16px;">${icon}</div>
      <span style="color: #2d3748; font-size: 14px;">${feature}</span>
    </div>
    `).join('')}
  </div>
</div>
    `;
  }
}