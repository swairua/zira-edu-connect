// Shared email configuration and utilities for all edge functions

export const EMAIL_CONFIG = {
  PLATFORM_NAME: "Zira EduSuite",
  LOGIN_URL: "https://zira-edu-connect.lovable.app/auth",
  PARENT_PORTAL_URL: "https://zira-edu-connect.lovable.app/parent",
  STUDENT_PORTAL_URL: "https://zira-edu-connect.lovable.app/student",
  SUPPORT_EMAIL: "support@ziratech.io",
};

export function getLoginButton(url: string, text: string): string {
  return `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0a7c73 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        ${text}
      </a>
    </div>
    <p style="color: #64748b; font-size: 14px; text-align: center;">
      Or visit: <a href="${url}" style="color: #0d9488;">${url}</a>
    </p>
  `;
}

export function getFooter(institutionName?: string): string {
  return `
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
    <p style="color: #94a3b8; font-size: 13px; margin: 0; text-align: center;">
      © 2026 ${EMAIL_CONFIG.PLATFORM_NAME}. All rights reserved.
    </p>
    ${institutionName ? `<p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0; text-align: center;">Sent on behalf of ${institutionName}</p>` : ''}
  `;
}

export function getEmailStyles(): string {
  return `
    margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
}
