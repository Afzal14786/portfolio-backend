import { BaseTemplate } from './base.templates.js';

export const getWelcomeTemplate = (userName) => {
  const subject = "Welcome to TerminalX! Your Account is Ready 🎉";
  const htmlBody = BaseTemplate.generate({
    title: "Welcome to TerminalX!",
    subtitle: "Your account is now active and ready",
    userName,
    headerColor: "linear-gradient(135deg, #28a745, #68d391)",
    headerIcon: "🎉",
    content: `
      <div style="text-align: center; margin-bottom: 40px;">
        <h2 style="color: #2d3748; font-size: 24px; font-weight: 700; margin: 0 0 16px 0;">Hello, ${userName}! 👋</h2>
        <p style="color: #718096; font-size: 16px; margin: 0; line-height: 1.6;">
          Congratulations! Your TerminalX account has been successfully verified and is now ready to use. 
          You're all set to explore our platform and start building amazing things.
        </p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        ${BaseTemplate.CTAButton("🚀 Start Exploring TerminalX", process.env.DASHBOARD_URL || "https://terminalx.com/login")}
      </div>

      ${BaseTemplate.FeatureList([
        "Complete your profile setup",
        "Explore our documentation",
        "Join our community",
        "Start your first project"
      ], "✅")}
    `,
    securityNotice: null,
    showSupportLink: true
  });

  return {
    subject,
    html: htmlBody,
    text: `Welcome to TerminalX, ${userName}! Your account is now active and ready to use. Visit ${process.env.FRONTEND_URL || 'https://terminalx.com'} to get started.`
  };
};