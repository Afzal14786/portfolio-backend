// Centralized template exports
export { 
  getOperationalEmail,
  getRegistrationTemplate,
  getLoginTemplate,
  getPasswordUpdateTemplate,
  getEmailUpdateTemplate
} from './templates/auth.templates.js';

export { 
  getNotificationEmail,
  getLoginSuccessTemplate
} from './templates/notification.templates.js';

export { 
  getPasswordResetLinkTemplate,
  getPasswordChangedTemplate
} from './templates/passwordReset.templates.js';

export { 
  getWelcomeTemplate
} from './templates/welcome.templates.js';

export { BaseTemplate } from './templates/base.templates.js';