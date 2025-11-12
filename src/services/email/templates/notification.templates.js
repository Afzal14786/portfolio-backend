import { BaseTemplate } from "./base.templates.js";

export const getNotificationEmail = (type, data) => {
  const templates = {
    // login success
    login_success: {
      subject: "Login Detected - TerminalX",
      header: "Login Successful",
      subtitle: "Your account was accessed",
      icon: "✅",
      gradient: "linear-gradient(135deg, #28a745, #68d391)",
      primaryColor: "#28a745",
      getContent: (data) => `
    <div style="text-align: center; margin-bottom: 40px;">
      <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${
        data.userName
      }</h2>
      <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
        Your TerminalX account was successfully accessed:
      </p>
    </div>
    
    <!-- Login Details -->
    <div style="background: #d1fae5; border: 2px solid #059669; border-radius: 12px; padding: 24px; margin: 32px 0;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; text-align: center;">
        <div>
          <div style="color: #065f46; font-size: 14px; font-weight: 600; margin-bottom: 8px;">📅 Date & Time</div>
          <div style="color: #047857; font-size: 16px; font-weight: 700;">${
            data.loginTime
              ? data.loginTime.toLocaleString()
              : new Date().toLocaleString()
          }</div>
        </div>
        ${
          data.location
            ? `
        <div>
          <div style="color: #065f46; font-size: 14px; font-weight: 600; margin-bottom: 8px;">📍 Location</div>
          <div style="color: #047857; font-size: 16px; font-weight: 700;">${data.location}</div>
        </div>
        `
            : ""
        }
        ${
          data.device
            ? `
        <div>
          <div style="color: #065f46; font-size: 14px; font-weight: 600; margin-bottom: 8px;">💻 Device</div>
          <div style="color: #047857; font-size: 16px; font-weight: 700;">${data.device}</div>
        </div>
        `
            : ""
        }
      </div>
    </div>

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton(
            "🔒 Review Account Security",
            data.actionUrl || `${process.env.DASHBOARD_URL}/security`
          )}
        </div>
      `,
      securityNotice:
        "If this wasn't you, please secure your account immediately by changing your password.",
      noticeType: "warning",
    },

    // password change
    password_changed: {
      subject: "Password Changed - TerminalX",
      header: "Password Updated",
      subtitle: "Your password has been changed",
      icon: "🔒",
      gradient: "linear-gradient(135deg, #d97706, #fbbf24)",
      primaryColor: "#d97706",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${
            data.userName
          }</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            Your TerminalX password was successfully changed.
          </p>
        </div>
        
        <div style="background: #fef5e7; border: 2px solid #d97706; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
          <div style="color: #92400e; font-size: 18px; font-weight: 700;">Password Updated Successfully</div>
          <div style="color: #b45309; font-size: 14px; margin-top: 8px;">${new Date().toLocaleString()}</div>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton(
            "🔐 Review Security Settings",
            data.actionUrl || `${process.env.DASHBOARD_URL}/security`
          )}
        </div>
      `,
      securityNotice:
        "If you didn't make this change, please contact support immediately.",
      noticeType: "warning",
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
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Security Alert, ${
            data.userName
          }</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            We detected unusual activity on your TerminalX account that might require your attention.
          </p>
        </div>
        
        <div style="background: #fed7d7; border: 2px solid #e53e3e; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <div style="color: #742a2a; font-size: 16px; font-weight: 700; text-align: center;">
            ${data.activityDescription || "Unusual login pattern detected"}
          </div>
          ${
            data.detectedAt
              ? `
          <div style="color: #c53030; font-size: 14px; text-align: center; margin-top: 8px;">
            Detected: ${data.detectedAt.toLocaleString()}
          </div>
          `
              : ""
          }
        </div>

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton(
            "🛡️ Secure My Account",
            data.actionUrl || `${process.env.DASHBOARD_URL}/security`
          )}
        </div>
      `,
      securityNotice:
        "If you recognize this activity, no action is needed. Otherwise, please secure your account immediately.",
      noticeType: "error",
    },
    // email id change
    email_change: {
      subject: "📧 Email Address Changed - TerminalX",
      header: "Email Address Updated",
      subtitle: "Your account email has been modified",
      icon: "✉️",
      gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
      primaryColor: "#7c3aed",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Email Change Detected</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            Hello <strong>${
              data.userName
            }</strong>, your account email address has been updated.
          </p>
        </div>
        
        <!-- Change Details -->
        <div style="background: #faf5ff; border: 2px solid #7c3aed; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center;">
            <div>
              <div style="color: #5b21b6; font-size: 14px; font-weight: 600; margin-bottom: 8px;">📧 Previous Email</div>
              <div style="color: #7c3aed; font-size: 14px; font-weight: 700; word-break: break-all;">${
                data.userEmail || "Not specified"
              }</div>
            </div>
            <div>
              <div style="color: #5b21b6; font-size: 14px; font-weight: 600; margin-bottom: 8px;">📧 New Email</div>
              <div style="color: #7c3aed; font-size: 14px; font-weight: 700; word-break: break-all;">${
                data.newEmail || "Not specified"
              }</div>
            </div>
          </div>
          <div style="text-align: center; margin-top: 16px;">
            <div style="color: #6b7280; font-size: 14px;">
              ⏰ Changed on: ${data.detectedAt.toLocaleString()}
            </div>
          </div>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton(
            "🔐 Review Account Settings",
            data.actionUrl || `${process.env.DASHBOARD_URL}/security`
          )}
        </div>
      `,
      securityNotice:
        "If you didn't make this change, contact support immediately to secure your account.",
      noticeType: "warning",
    },

    // two fector authentication
    two_factor_enabled: {
      subject: "🔒 Two-Factor Authentication Enabled - TerminalX",
      header: "2FA Activated",
      subtitle: "Extra security layer added to your account",
      icon: "🛡️",
      gradient: "linear-gradient(135deg, #059669, #10b981)",
      primaryColor: "#059669",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">2FA Successfully Enabled</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            Hello <strong>${
              data.userName
            }</strong>, two-factor authentication has been activated for your account.
          </p>
        </div>
        
        <div style="background: #d1fae5; border: 2px solid #059669; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">🛡️</div>
          <div style="color: #065f46; font-size: 18px; font-weight: 700;">Enhanced Security Active</div>
          <div style="color: #047857; font-size: 14px; margin-top: 8px;">
            Your account is now protected with an additional security layer
          </div>
        </div>

        <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <h4 style="color: #065f46; margin: 0 0 12px 0;">What this means:</h4>
          <ul style="color: #047857; margin: 0; padding-left: 20px;">
            <li>Extra security code required for login</li>
            <li>Protection against unauthorized access</li>
            <li>Secure account recovery options</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton(
            "⚙️ Manage Security Settings",
            data.actionUrl || `${process.env.DASHBOARD_URL}/security`
          )}
        </div>
      `,
      securityNotice:
        "Keep your 2FA recovery codes in a safe place. You'll need them if you lose access to your authenticator app.",
      noticeType: "info",
    },

    // new device login
    new_device_login: {
      subject: "🆕 New Device Login - TerminalX",
      header: "New Device Detected",
      subtitle: "Your account was accessed from a new device",
      icon: "💻",
      gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
      primaryColor: "#d97706",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">New Login Device</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            Hello <strong>${
              data.userName
            }</strong>, we noticed a login from a device we haven't seen before.
          </p>
        </div>
        
        <!-- Device Details -->
        <div style="background: #fffbeb; border: 2px solid #d97706; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; text-align: center;">
            <div>
              <div style="color: #92400e; font-size: 14px; font-weight: 600; margin-bottom: 8px;">💻 Device</div>
              <div style="color: #b45309; font-size: 16px; font-weight: 700;">${
                data.device || "Unknown Device"
              }</div>
            </div>
            <div>
              <div style="color: #92400e; font-size: 14px; font-weight: 600; margin-bottom: 8px;">📍 Location</div>
              <div style="color: #b45309; font-size: 16px; font-weight: 700;">${
                data.location || "Unknown Location"
              }</div>
            </div>
            <div>
              <div style="color: #92400e; font-size: 14px; font-weight: 600; margin-bottom: 8px;">🕐 Time</div>
              <div style="color: #b45309; font-size: 16px; font-weight: 700;">${data.loginTime.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div style="background: #fefce8; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
          <p style="color: #713f12; margin: 0; font-size: 14px;">
            <strong>Is this you?</strong> If you recognize this activity, no action is needed. 
            If not, please secure your account immediately.
          </p>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton(
            "🚨 Secure My Account",
            data.actionUrl || `${process.env.DASHBOARD_URL}/security`
          )}
          <div style="margin-top: 16px;">
            ${BaseTemplate.SecondaryButton(
              "📋 View Login History",
              `${process.env.DASHBOARD_URL}/sessions`
            )}
          </div>
        </div>
      `,
      securityNotice:
        "If this wasn't you, change your password immediately and review your account security settings.",
      noticeType: "warning",
    },

    // NEW: Account Recovery Initiated
    account_recovery: {
      subject: "🔓 Account Recovery Started - TerminalX",
      header: "Account Recovery",
      subtitle: "Recovery process has been initiated",
      icon: "🔑",
      gradient: "linear-gradient(135deg, #dc2626, #ef4444)",
      primaryColor: "#dc2626",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Account Recovery Started</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            Hello <strong>${
              data.userName
            }</strong>, an account recovery process has been initiated.
          </p>
        </div>
        
        <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">🚨</div>
          <div style="color: #991b1b; font-size: 18px; font-weight: 700;">Security Alert</div>
          <div style="color: #dc2626; font-size: 14px; margin-top: 8px;">
            Recovery initiated from: ${data.location || "Unknown location"}
          </div>
          <div style="color: #dc2626; font-size: 12px; margin-top: 12px;">
            ${data.detectedAt.toLocaleString()}
          </div>
        </div>

        <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <h4 style="color: #991b1b; margin: 0 0 12px 0;">Immediate Action Required:</h4>
          <ul style="color: #dc2626; margin: 0; padding-left: 20px;">
            <li>If you initiated this recovery, follow the instructions sent to your email</li>
            <li>If you DID NOT initiate this, contact support immediately</li>
            <li>Review your account security settings</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton(
            "🆘 Contact Support",
            "mailto:support@terminalx.com"
          )}
        </div>
      `,
      securityNotice:
        "If you didn't request account recovery, your account may be compromised. Contact support immediately.",
      noticeType: "error",
    },

    // NEW: Profile Information Updated
    profile_updated: {
      subject: "👤 Profile Updated - TerminalX",
      header: "Profile Changes Saved",
      subtitle: "Your account information has been modified",
      icon: "📝",
      gradient: "linear-gradient(135deg, #0369a1, #0ea5e9)",
      primaryColor: "#0369a1",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Profile Updated Successfully</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            Hello <strong>${
              data.userName
            }</strong>, your profile information has been updated.
          </p>
        </div>
        
        <!-- Update Summary -->
        <div style="background: #f0f9ff; border: 2px solid #0369a1; border-radius: 12px; padding: 24px; margin: 32px 0;">
          <div style="color: #075985; font-size: 16px; font-weight: 700; text-align: center; margin-bottom: 16px;">
            Changes Made:
          </div>
          <div style="color: #0c4a6e; font-size: 14px; line-height: 1.6;">
            ${data.changesSummary || "Profile information modified"}
          </div>
          <div style="text-align: center; margin-top: 16px;">
            <div style="color: #0284c7; font-size: 12px;">
              Updated on: ${data.detectedAt.toLocaleString()}
            </div>
          </div>
        </div>

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton(
            "👀 View My Profile",
            data.actionUrl || `${process.env.DASHBOARD_URL}/profile`
          )}
        </div>
      `,
      securityNotice:
        "You're receiving this email to keep you informed about changes to your account.",
      noticeType: "info",
    },
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
    showSupportLink: true,
  });

  return {
    subject: template.subject,
    html: htmlBody,
    text: generateNotificationText(type, data),
  };
};

// Add this helper function at the top of your file
const safeDateString = (date) => {
  if (!date) return new Date().toLocaleString();
  if (typeof date === "string") return new Date(date).toLocaleString();
  if (date instanceof Date) return date.toLocaleString();
  return new Date().toLocaleString();
};

const generateNotificationText = (type, data) => {
  const textTemplates = {
    login_success: `Your TerminalX account was accessed on ${safeDateString(
      data.loginTime
    )}. If this wasn't you, please change your password immediately.`,

    password_changed: `Your TerminalX password was changed on ${safeDateString(
      data.detectedAt
    )}. If you didn't make this change, contact support immediately.`,

    suspicious_activity: `Suspicious activity detected on your TerminalX account: ${
      data.activityDescription || "Unusual login pattern"
    }. Please review your account security.`,

    email_change: `Your TerminalX email was changed from ${
      data.previousEmail || "previous email"
    } to ${data.newEmail || "new email"} on ${safeDateString(
      data.detectedAt
    )}. If this wasn't you, contact support immediately.`,

    two_factor_enabled: `Two-factor authentication has been enabled for your TerminalX account. Enhanced security is now active. Keep your recovery codes safe.`,

    new_device_login: `New login detected on your TerminalX account from ${
      data.device || "unknown device"
    } in ${data.location || "unknown location"} at ${safeDateString(
      data.loginTime
    )}. If this wasn't you, secure your account immediately.`,

    account_recovery: `Account recovery initiated for your TerminalX account from ${
      data.location || "unknown location"
    } on ${safeDateString(
      data.detectedAt
    )}. If this wasn't you, contact support immediately at support@terminalx.com.`,

    profile_updated: `Your TerminalX profile has been updated. Changes: ${
      data.changesSummary || "Profile information modified"
    }. Updated on ${safeDateString(data.detectedAt)}.`,
  };

  return textTemplates[type] || "Notification from TerminalX";
};

// Legacy individual templates
export const getLoginSuccessTemplate = (userName, loginTime = new Date()) =>
  getNotificationEmail("login_success", { userName, loginTime });
