import { BaseTemplate } from './base.templates.js';

export const getNotificationEmail = (type, data) => {
  const templates = {
    login_success: {
      subject: "Login Detected - TerminalX",
      header: "Login Successful",
      subtitle: "Your account was accessed",
      icon: "✅", 
      gradient: "linear-gradient(135deg, #28a745, #68d391)",
      primaryColor: "#28a745",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${data.userName}</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            Your TerminalX account was successfully accessed:
          </p>
        </div>
        
        <!-- Login Details -->
        <div style="background: #d1fae5; border: 2px solid #059669; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; text-align: center;">
            <div>
              <div style="color: #065f46; font-size: 14px; font-weight: 600; margin-bottom: 8px;">📅 Date & Time</div>
              <div style="color: #047857; font-size: 16px; font-weight: 700;">${data.loginTime.toLocaleString()}</div>
            </div>
            ${data.location ? `
            <div>
              <div style="color: #065f46; font-size: 14px; font-weight: 600; margin-bottom: 8px;">📍 Location</div>
              <div style="color: #047857; font-size: 16px; font-weight: 700;">${data.location}</div>
            </div>
            ` : ''}
            ${data.device ? `
            <div>
              <div style="color: #065f46; font-size: 14px; font-weight: 600; margin-bottom: 8px;">💻 Device</div>
              <div style="color: #047857; font-size: 16px; font-weight: 700;">${data.device}</div>
            </div>
            ` : ''}
          </div>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton("🔒 Review Account Security", data.actionUrl || `${process.env.DASHBOARD_URL}/security`)}
        </div>
      `,
      securityNotice: "If this wasn't you, please secure your account immediately by changing your password.",
      noticeType: "warning"
    },

    password_changed: {
      subject: "Password Changed - TerminalX", 
      header: "Password Updated",
      subtitle: "Your password has been changed",
      icon: "🔒",
      gradient: "linear-gradient(135deg, #d97706, #fbbf24)", 
      primaryColor: "#d97706",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${data.userName}</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            Your TerminalX password was successfully changed.
          </p>
        </div>
        
        <div style="background: #fef5e7; border: 2px solid #d97706; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
          <div style="color: #92400e; font-size: 18px; font-weight: 700;">Password Updated Successfully</div>
          <div style="color: #b45309; font-size: 14px; margin-top: 8px;">${new Date().toLocaleString()}</div>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton("🔐 Review Security Settings", data.actionUrl || `${process.env.DASHBOARD_URL}/security`)}
        </div>
      `,
      securityNotice: "If you didn't make this change, please contact support immediately.",
      noticeType: "warning"
    },

    suspicious_activity: {
      subject: "Suspicious Activity Detected - TerminalX",
      header: "Suspicious Activity",
      subtitle: "Unusual activity detected on your account",
      icon: "🚨",
      gradient: "linear-gradient(135deg, #e53e3e, #fc8181)",
      primaryColor: "#e53e3e",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Security Alert, ${data.userName}</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            We detected unusual activity on your TerminalX account that might require your attention.
          </p>
        </div>
        
        <div style="background: #fed7d7; border: 2px solid #e53e3e; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <div style="color: #742a2a; font-size: 16px; font-weight: 700; text-align: center;">
            ${data.activityDescription || "Unusual login pattern detected"}
          </div>
          ${data.detectedAt ? `
          <div style="color: #c53030; font-size: 14px; text-align: center; margin-top: 8px;">
            Detected: ${data.detectedAt.toLocaleString()}
          </div>
          ` : ''}
        </div>

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton("🛡️ Secure My Account", data.actionUrl || `${process.env.DASHBOARD_URL}/security`)}
        </div>
      `,
      securityNotice: "If you recognize this activity, no action is needed. Otherwise, please secure your account immediately.",
      noticeType: "error"
    }
  };

  const template = templates[type];
  if (!template) {
    throw new Error(`Unknown notification email type: ${type}`);
  }

  const htmlBody = BaseTemplate.generate({
    title: template.header,
    subtitle: template.subtitle,
    userName: data.userName,
    headerColor: template.gradient, 
    headerIcon: template.icon,
    content: template.getContent(data),
    securityNotice: template.securityNotice,
    noticeType: template.noticeType,
    showSupportLink: true
  });

  return {
    subject: template.subject,
    html: htmlBody,
    text: generateNotificationText(type, data)
  };
};

const generateNotificationText = (type, data) => {
  const textTemplates = {
    login_success: `Your TerminalX account was accessed on ${data.loginTime.toLocaleString()}. If this wasn't you, please change your password immediately.`,
    password_changed: `Your TerminalX password was changed on ${new Date().toLocaleString()}. If you didn't make this change, contact support immediately.`,
    suspicious_activity: `Suspicious activity detected on your TerminalX account: ${data.activityDescription || "Unusual login pattern"}. Please review your account security.`
  };
  return textTemplates[type] || "Notification from TerminalX";
};

// Legacy individual templates
export const getLoginSuccessTemplate = (userName, loginTime = new Date()) => 
  getNotificationEmail('login_success', { userName, loginTime });