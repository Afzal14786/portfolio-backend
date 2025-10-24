import { sendEmail } from "../../emails/sendEmail.js";
import { 
  getRegistrationTemplate,
  getLoginTemplate,
  getPasswordUpdateTemplate,
  getEmailUpdateTemplate,
  getLoginSuccessTemplate
} from './templates/auth.templates.js';

import { getWelcomeTemplate } from './templates/welcome.templates.js';

export class EmailService {
  /**
   * Send OTP email based on type
   */
  static async sendOTPEmail(email, otp, type, userName = 'User') {
    const templateConfig = {
      registration: getRegistrationTemplate(otp, userName),
      login: getLoginTemplate(otp, userName),
      password_reset: getPasswordResetTemplate(otp, userName),
      password_update: getPasswordUpdateTemplate(otp, userName),
      email_update: getEmailUpdateTemplate(otp, userName)
    };

    const template = templateConfig[type];
    
    if (!template) {
      throw new Error(`Invalid email template type: ${type}`);
    }

    return await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Send welcome email
   */
  static async sendWelcomeEmail(email, userName) {
    const template = getWelcomeTemplate(userName);
    
    return await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  /**
   * Send login success notification
   */
  static async sendLoginSuccessEmail(email, userName, loginTime = new Date()) {
    const template = getLoginSuccessTemplate(userName, loginTime);
    
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

// For backward compatibility
export const sendOTPEmail = EmailService.sendOTPEmail;
export const sendWelcomeEmail = EmailService.sendWelcomeEmail;
export const sendLoginSuccessEmail = EmailService.sendLoginSuccessEmail;
export const sendPasswordChangedEmail = EmailService.sendPasswordChangedEmail;