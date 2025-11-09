import { BaseTemplate } from './base.templates.js';

export const getOperationalEmail = (type, data) => {
  const templates = {
    registration: {
      subject: "Verify Your Email - TerminalX",
      header: "Verify Your Email",
      subtitle: "Complete your TerminalX registration",
      icon: "📧",
      gradient: "linear-gradient(135deg, #28a745, #68d391)",
      primaryColor: "#28a745",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Welcome, ${data.userName}!</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            Thank you for registering with TerminalX! Use the verification code below to verify your email address and activate your account.
          </p>
        </div>
        
        ${BaseTemplate.OTPSection(data.otp, "Email Verification Code", "#28a745", `${data.expiresInMinutes || 10} minutes`)}

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton("Verify Account", data.actionUrl || process.env.DASHBOARD_URL)}
        </div>
      `,
      securityNotice: "This code will expire in 10 minutes. Please verify your email promptly.",
      noticeType: "info"
    },

    login: {
      subject: "Login Verification Code - TerminalX", 
      header: "Login Verification",
      subtitle: "Secure access to your account",
      icon: "🔐",
      gradient: "linear-gradient(135deg, #0066ff, #00e0ff)",
      primaryColor: "#0066ff",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${data.userName}! 👋</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            You are attempting to login to your TerminalX account. Use the verification code below to complete your login.
          </p>
        </div>
        
        ${BaseTemplate.OTPSection(data.otp, "Login Verification Code", "#0066ff", `${data.expiresInMinutes || 10} minutes`)}

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton("🔐 Complete Login", data.actionUrl || process.env.DASHBOARD_URL)}
        </div>
      `,
      securityNotice: "If you did not attempt to login, please ignore this email or contact support immediately.",
      noticeType: "warning"
    },

    password_reset: {
      subject: "Password Reset Verification - TerminalX",
      header: "Reset Your Password", 
      subtitle: "Secure your account access",
      icon: "🔄",
      gradient: "linear-gradient(135deg, #e53e3e, #fc8181)",
      primaryColor: "#e53e3e",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${data.userName}</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            You requested to reset your TerminalX password. Use the verification code below to proceed with resetting your password.
          </p>
        </div>
        
        ${BaseTemplate.OTPSection(data.otp, "Password Reset Code", "#e53e3e", `${data.expiresInMinutes || 10} minutes`)}

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton("🔑 Reset Password", data.actionUrl || process.env.DASHBOARD_URL)}
        </div>
      `,
      securityNotice: "If you didn't request this reset, please secure your account immediately.",
      noticeType: "warning"
    },

    email_update: {
      subject: "Email Update Verification - TerminalX",
      header: "Update Your Email",
      subtitle: "Verify email address change", 
      icon: "✉️",
      gradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
      primaryColor: "#7c3aed",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${data.userName}</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            You are attempting to update your email address. Use the verification code below to verify this change.
          </p>
        </div>
        
        ${BaseTemplate.OTPSection(data.otp, "Email Update Code", "#7c3aed", `${data.expiresInMinutes || 10} minutes`)}

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton("Verify Email Change", data.actionUrl || process.env.DASHBOARD_URL)}
        </div>
      `,
      securityNotice: "This code verifies your email address change request.",
      noticeType: "info"
    },

    password_update: {
      subject: "Password Update Verification - TerminalX",
      header: "Update Your Password",
      subtitle: "Verify password change request",
      icon: "🔒",
      gradient: "linear-gradient(135deg, #d97706, #fbbf24)",
      primaryColor: "#d97706",
      getContent: (data) => `
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${data.userName}</h2>
          <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
            You are attempting to update your TerminalX password. Use the verification code below to verify this action.
          </p>
        </div>
        
        ${BaseTemplate.OTPSection(data.otp, "Password Update Code", "#d97706", `${data.expiresInMinutes || 10} minutes`)}

        <div style="text-align: center; margin: 40px 0;">
          ${BaseTemplate.CTAButton("🔐 Verify Password Update", data.actionUrl || process.env.DASHBOARD_URL)}
        </div>
      `,
      securityNotice: "This code verifies your password change request. Keep it secure.",
      noticeType: "info"
    }
  };

  const template = templates[type];
  if (!template) {
    throw new Error(`Unknown operational email type: ${type}`);
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
    text: generateTextTemplate(type, data)
  };
};

// Helper for text versions
const generateTextTemplate = (type, data) => {
  const textTemplates = {
    registration: `Your TerminalX registration OTP is: ${data.otp}. It expires in ${data.expiresInMinutes || 10} minutes. Use it to verify your account.`,
    login: `Your TerminalX login OTP is: ${data.otp}. It expires in ${data.expiresInMinutes || 10} minutes. If you didn't request this, please ignore this email.`,
    password_reset: `Your TerminalX password reset OTP is: ${data.otp}. It expires in ${data.expiresInMinutes || 10} minutes. If you didn't request this reset, please secure your account.`,
    email_update: `Your TerminalX email update OTP is: ${data.otp}. It expires in ${data.expiresInMinutes || 10} minutes.`,
    password_update: `Your TerminalX password update OTP is: ${data.otp}. It expires in ${data.expiresInMinutes || 10} minutes.`
  };
  return textTemplates[type] || `Your verification code is: ${data.otp}`;
};

// Legacy individual templates (for backward compatibility)
export const getRegistrationTemplate = (otp, userName, expiresInMinutes = 10) => 
  getOperationalEmail('registration', { otp, userName, expiresInMinutes });

export const getLoginTemplate = (otp, userName, expiresInMinutes = 10) => 
  getOperationalEmail('login', { otp, userName, expiresInMinutes });

export const getPasswordUpdateTemplate = (otp, userName, expiresInMinutes = 10) => 
  getOperationalEmail('password_update', { otp, userName, expiresInMinutes });

export const getEmailUpdateTemplate = (otp, userName, expiresInMinutes = 10) => 
  getOperationalEmail('email_update', { otp, userName, expiresInMinutes });