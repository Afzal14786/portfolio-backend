import { BaseTemplate } from './base.templates.js';

export const getLoginTemplate = (otp, userName, expiresInMinutes = 10) => {
  const subject = "Login Verification Code - TerminalX";
  const htmlBody = BaseTemplate.generate({
    title: "Login Verification",
    subtitle: "Secure access to your account",
    userName,
    headerColor: "linear-gradient(135deg, #0066ff, #00e0ff)",
    headerIcon: "🔐",
    content: `
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${userName}! 👋</h2>
        <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
          You are attempting to login to your TerminalX account. Use the verification code below to complete your login.
        </p>
      </div>
      
      ${BaseTemplate.OTPSection(otp, "Login Verification Code", "#0066ff", `${expiresInMinutes} minutes`)}

      <div style="text-align: center; margin: 40px 0;">
        ${BaseTemplate.CTAButton("🔐 Complete Login", process.env.DASHBOARD_URL || "https://terminalx.com/login")}
      </div>
    `,
    securityNotice: "If you did not attempt to login, please ignore this email or contact support immediately.",
    noticeType: "warning",
    showSupportLink: true
  });

  return {
    subject,
    html: htmlBody,
    text: `Your TerminalX login OTP is: ${otp}. It expires in ${expiresInMinutes} minutes. If you didn't request this, please ignore this email.`
  };
};

export const getRegistrationTemplate = (otp, userName, expiresInMinutes = 10) => {
  const subject = "Verify Your Email - TerminalX";
  const htmlBody = BaseTemplate.generate({
    title: "Verify Your Email",
    subtitle: "Complete your TerminalX registration",
    userName,
    headerColor: "linear-gradient(135deg, #28a745, #68d391)",
    headerIcon: "📧",
    content: `
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Welcome, ${userName}! 🎉</h2>
        <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
          Thank you for registering with TerminalX! Use the verification code below to verify your email address and activate your account.
        </p>
      </div>
      
      ${BaseTemplate.OTPSection(otp, "Email Verification Code", "#28a745", `${expiresInMinutes} minutes`)}

      <div style="text-align: center; margin: 40px 0;">
        ${BaseTemplate.CTAButton("✅ Verify Account", process.env.DASHBOARD_URL || "https://terminalx.com/verify")}
      </div>
    `,
    securityNotice: "This code will expire in 10 minutes. Please verify your email promptly.",
    noticeType: "info",
    showSupportLink: true
  });

  return {
    subject,
    html: htmlBody,
    text: `Your TerminalX registration OTP is: ${otp}. It expires in ${expiresInMinutes} minutes. Use it to verify your account.`
  };
};


export const getPasswordUpdateTemplate = (otp, userName, expiresInMinutes = 10) => {
  const subject = "Password Update Verification - TerminalX";
  const htmlBody = BaseTemplate.generate({
    title: "Update Your Password",
    subtitle: "Verify password change request",
    userName,
    headerColor: "linear-gradient(135deg, #d97706, #fbbf24)",
    headerIcon: "🔒",
    content: `
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${userName}</h2>
        <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
          You are attempting to update your TerminalX password. Use the verification code below to verify this action.
        </p>
      </div>
      
      ${BaseTemplate.OTPSection(otp, "Password Update Code", "#d97706", `${expiresInMinutes} minutes`)}

      <div style="text-align: center; margin: 40px 0;">
        ${BaseTemplate.CTAButton("🔐 Verify Password Update", process.env.DASHBOARD_URL || "https://terminalx.com/settings")}
      </div>
    `,
    securityNotice: "This code verifies your password change request. Keep it secure.",
    noticeType: "info",
    showSupportLink: true
  });

  return {
    subject,
    html: htmlBody,
    text: `Your TerminalX password update OTP is: ${otp}. It expires in ${expiresInMinutes} minutes.`
  };
};

export const getEmailUpdateTemplate = (otp, userName, expiresInMinutes = 10) => {
  const subject = "Email Update Verification - TerminalX";
  const htmlBody = BaseTemplate.generate({
    title: "Update Your Email",
    subtitle: "Verify email address change",
    userName,
    headerColor: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    headerIcon: "✉️",
    content: `
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${userName}</h2>
        <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
          You are attempting to update your email address. Use the verification code below to verify this change.
        </p>
      </div>
      
      ${BaseTemplate.OTPSection(otp, "Email Update Code", "#7c3aed", `${expiresInMinutes} minutes`)}

      <div style="text-align: center; margin: 40px 0;">
        ${BaseTemplate.CTAButton("✅ Verify Email Change", process.env.DASHBOARD_URL || "https://terminalx.com/settings")}
      </div>
    `,
    securityNotice: "This code verifies your email address change request.",
    noticeType: "info",
    showSupportLink: true
  });

  return {
    subject,
    html: htmlBody,
    text: `Your TerminalX email update OTP is: ${otp}. It expires in ${expiresInMinutes} minutes.`
  };
};

// Success notification templates
export const getLoginSuccessTemplate = (userName, loginTime = new Date()) => {
  const formattedTime = loginTime.toLocaleString();
  const subject = "Login Successful - TerminalX";
  const htmlBody = BaseTemplate.generate({
    title: "Login Successful",
    subtitle: "Your account was accessed",
    userName,
    headerColor: "linear-gradient(135deg, #28a745, #68d391)",
    headerIcon: "✅",
    content: `
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${userName}</h2>
        <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
          Your TerminalX account was successfully accessed on:
        </p>
      </div>
      
      <div style="background: #d1fae5; border: 2px solid #059669; border-radius: 12px; padding: 24px; margin: 32px 0; text-align: center;">
        <div style="color: #065f46; font-size: 18px; font-weight: 700;">${formattedTime}</div>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        ${BaseTemplate.CTAButton("🔒 View Account Security", process.env.DASHBOARD_URL || "https://terminalx.com/security")}
      </div>
    `,
    securityNotice: "If this wasn't you, please secure your account immediately by changing your password.",
    noticeType: "warning",
    showSupportLink: true
  });

  return {
    subject,
    html: htmlBody,
    text: `Your TerminalX account was successfully accessed on ${formattedTime}. If this wasn't you, please change your password immediately.`
  };
};