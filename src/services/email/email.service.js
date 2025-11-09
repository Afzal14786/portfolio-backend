import { sendEmail } from "../../emails/sendEmail.js";
import { getOperationalEmail } from './templates/auth.templates.js';
import { getNotificationEmail } from './templates/notification.templates.js';
import { getWelcomeTemplate } from './templates/welcome.templates.js';
import { getPasswordResetLinkTemplate, getPasswordChangedTemplate } from './templates/passwordReset.templates.js';

export class EmailService {
  /**
   * Send operational emails (OTP, verification, security actions)
   * Types: 'registration', 'login', 'password_reset', 'email_update', 'password_update'
   */
  static async sendOperationalEmail(type, data) {
    const template = getOperationalEmail(type, {
      userName: data.userName,
      otp: data.otp,
      expiresInMinutes: data.expiresInMinutes || 10,
      actionUrl: data.actionUrl
    });

    return await sendEmail({
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Send notification emails (login alerts, security events)
   * Types: 'login_success', 'password_changed', 'suspicious_activity'
   */
  static async sendNotificationEmail(type, data) {
    const template = getNotificationEmail(type, {
      userName: data.userName,
      loginTime: data.loginTime || new Date(),
      location: data.location,
      device: data.device,
      activityDescription: data.activityDescription,
      detectedAt: data.detectedAt,
      actionUrl: data.actionUrl
    });

    return await sendEmail({
      to: data.email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Send welcome/onboarding emails
   */
  static async sendWelcomeEmail(email, userName, actionUrl = process.env.DASHBOARD_URL) {
    const template = getWelcomeTemplate(userName);

    return await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Send password reset link email
   */
  static async sendPasswordResetEmail(email, resetUrl, userName, expiresInMinutes = 10) {
    const template = getPasswordResetLinkTemplate(resetUrl, userName, expiresInMinutes);

    return await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Send password changed confirmation
   */
  static async sendPasswordChangedEmail(email, userName) {
    const template = getPasswordChangedTemplate(userName);

    return await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }
}

// Unified interface exports (RECOMMENDED - use these)
export const sendOperationalEmail = EmailService.sendOperationalEmail;
export const sendNotificationEmail = EmailService.sendNotificationEmail;
export const sendWelcomeEmail = EmailService.sendWelcomeEmail;
export const sendPasswordResetEmail = EmailService.sendPasswordResetEmail;
export const sendPasswordChangedEmail = EmailService.sendPasswordChangedEmail;

// Legacy compatibility (optional - can be removed eventually)
export const sendOTPEmail = (email, otp, type, userName) => 
  EmailService.sendOperationalEmail(type, { email, otp, userName });

export const sendLoginSuccessEmail = (email, userName, loginTime) =>
  EmailService.sendNotificationEmail('login_success', { email, userName, loginTime });