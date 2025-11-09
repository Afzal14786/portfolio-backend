// Centralized template exports
export { 
  getOperationalEmail,
  getRegistrationTemplate,
  getLoginTemplate,
  getPasswordUpdateTemplate,
  getEmailUpdateTemplate
} from './auth.templates.js';

export { 
  getNotificationEmail,
  getLoginSuccessTemplate
} from './notification.templates.js';

export { 
  getPasswordResetLinkTemplate,
  getPasswordChangedTemplate
} from './passwordReset.templates.js';

export { 
  getWelcomeTemplate
} from './welcome.templates.js';

export { BaseTemplate } from './base.templates.js';