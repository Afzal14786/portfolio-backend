import { BaseTemplate } from './base.templates.js';

export const getPasswordResetLinkTemplate = (resetUrl, userName, expiresInMinutes = 10) => {
  const subject = "Password Reset Request - TerminalX";
  const htmlBody = BaseTemplate.generate({
    title: "Reset Your Password",
    subtitle: "Secure your account access",
    userName,
    headerColor: "linear-gradient(135deg, #e53e3e, #fc8181)",
    headerIcon: "🔄",
    content: `
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${userName}</h2>
        <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
          You requested to reset your TerminalX password. Click the button below to securely reset your password.
        </p>
      </div>
      
      <!-- Reset Link Section -->
      <div style="background: linear-gradient(135deg, #f7fafc, #edf2f7); border: 2px dashed #e2e8f0; border-radius: 16px; padding: 32px; margin: 32px 0; text-align: center;">
        <p style="color: #4a5568; font-size: 14px; font-weight: 600; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">
          Secure Password Reset
        </p>
        <p style="color: #718096; font-size: 14px; margin: 0 0 20px 0;">
          Click the button below to create a new password
        </p>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        ${BaseTemplate.CTAButton("🔑 Reset Password", resetUrl, "#e53e3e")}
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <p style="color: #718096; font-size: 14px; margin: 0;">
          Or copy and paste this link in your browser:
        </p>
        <p style="background: #f7fafc; padding: 12px; border-radius: 8px; margin: 10px 0; word-break: break-all; font-family: monospace; font-size: 12px; color: #4a5568;">
          ${resetUrl}
        </p>
      </div>
    `,
    securityNotice: `This password reset link will expire in ${expiresInMinutes} minutes. If you didn't request this reset, please ignore this email.`,
    noticeType: "warning",
    showSupportLink: true
  });

  return {
    subject,
    html: htmlBody,
    text: `Click this link to reset your TerminalX password: ${resetUrl}\nThis link expires in ${expiresInMinutes} minutes. If you didn't request this, please ignore this email.`
  };
};

export const getPasswordChangedTemplate = (userName) => {
  const subject = "Password Changed Successfully - TerminalX";
  const htmlBody = BaseTemplate.generate({
    title: "Password Changed",
    subtitle: "Your password has been updated",
    userName,
    headerColor: "linear-gradient(135deg, #28a745, #68d391)",
    headerIcon: "🔒",
    content: `
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${userName}</h2>
        <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
          Your TerminalX password has been changed successfully.
        </p>
      </div>
      
      <div style="background: #d1fae5; border: 2px solid #059669; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
        <div style="color: #065f46; font-size: 18px; font-weight: 700;">Password Updated Successfully</div>
      </div>
        
      <div style="text-align: center; margin: 40px 0;">
        ${BaseTemplate.CTAButton("🔐 Review Account Security", process.env.DASHBOARD_URL || "https://terminalx.com/security")}
      </div>
    `,
    securityNotice: "If you didn't make this change, please contact support immediately.",
    noticeType: "warning",
    showSupportLink: true
  });

  return {
    subject,
    html: htmlBody,
    text: `Your TerminalX password has been changed successfully. If you didn't make this change, contact support immediately.`
  };
};