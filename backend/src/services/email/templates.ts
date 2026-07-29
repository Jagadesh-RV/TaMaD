interface EmailTemplate {
  subject: string;
  html: (data: Record<string, string>) => string;
}

const baseStyle = `
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
  .container { max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 8px; }
  .header { text-align: center; padding: 24px 0; border-bottom: 1px solid #e5e5e5; }
  .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
  .content { padding: 24px 0; line-height: 1.6; color: #374151; }
  .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500; }
  .footer { text-align: center; padding: 16px 0; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e5e5; }
  h1 { color: #111827; font-size: 20px; margin-bottom: 16px; }
  p { margin: 8px 0; }
</style>
`;

const footer = `
<div class="footer">
  <p>TaMaD - Team Workspace Management</p>
  <p>If you didn't request this email, you can safely ignore it.</p>
</div>
`;

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html><head>${baseStyle}</head><body>
<div class="container">
  <div class="header"><div class="logo">TaMaD</div></div>
  <div class="content">${body}</div>
  ${footer}
</div>
</body></html>`;
}

export const emailTemplates: Record<string, EmailTemplate> = {
  welcome: {
    subject: 'Welcome to TaMaD!',
    html: (data) => wrapHtml(`
      <h1>Welcome to TaMaD, ${data.name || 'there'}!</h1>
      <p>We're excited to have you on board. TaMaD helps you and your team stay organized, collaborate in real-time, and get more done.</p>
      <p>Here are a few things you can do to get started:</p>
      <ul>
        <li>Create your first project</li>
        <li>Invite team members to your workspace</li>
        <li>Set up your task board</li>
        <li>Explore the AI assistant</li>
      </ul>
      <p style="text-align:center;margin-top:24px;">
        <a href="${data.appUrl || 'http://localhost:5173'}" class="button">Get Started</a>
      </p>
    `),
  },

  verifyEmail: {
    subject: 'Verify your email address',
    html: (data) => wrapHtml(`
      <h1>Email Verification</h1>
      <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${data.verificationUrl || '#'}" class="button">Verify Email</a>
      </p>
      <p>Or copy and paste this link: ${data.verificationUrl || '#'}</p>
      <p>This link expires in 24 hours.</p>
    `),
  },

  passwordReset: {
    subject: 'Reset your password',
    html: (data) => wrapHtml(`
      <h1>Password Reset</h1>
      <p>We received a request to reset your password. Click the button below to set a new one:</p>
      <p style="text-align:center;margin:24px 0;">
        <a href="${data.resetUrl || '#'}" class="button">Reset Password</a>
      </p>
      <p>Or copy and paste this link: ${data.resetUrl || '#'}</p>
      <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
    `),
  },

  taskReminder: {
    subject: 'Task Reminder: ${data.taskTitle}',
    html: (data) => wrapHtml(`
      <h1>Task Reminder</h1>
      <p>This is a reminder about your task:</p>
      <p style="font-size:18px;font-weight:500;">${data.taskTitle || 'Untitled Task'}</p>
      ${data.taskDescription ? `<p>${data.taskDescription}</p>` : ''}
      ${data.dueDate ? `<p><strong>Due:</strong> ${data.dueDate}</p>` : ''}
      ${data.priority ? `<p><strong>Priority:</strong> ${data.priority}</p>` : ''}
      <p style="text-align:center;margin:24px 0;">
        <a href="${data.taskUrl || '#'}" class="button">View Task</a>
      </p>
    `),
  },

  workspaceInvitation: {
    subject: 'You\'ve been invited to a workspace',
    html: (data) => wrapHtml(`
      <h1>Workspace Invitation</h1>
      <p>${data.inviterName || 'Someone'} has invited you to join <strong>${data.workspaceName || 'a workspace'}</strong> on TaMaD.</p>
      ${data.message ? `<p>"${data.message}"</p>` : ''}
      <p style="text-align:center;margin:24px 0;">
        <a href="${data.invitationUrl || '#'}" class="button">Accept Invitation</a>
      </p>
    `),
  },

  weeklySummary: {
    subject: 'Your Weekly TaMaD Summary',
    html: (data) => wrapHtml(`
      <h1>Weekly Summary</h1>
      <p>Here's what happened in your workspace this week:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;border-bottom:1px solid #e5e5e5;"><strong>Tasks Completed</strong></td><td style="padding:8px;border-bottom:1px solid #e5e5e5;">${data.tasksCompleted || '0'}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e5e5;"><strong>Tasks Created</strong></td><td style="padding:8px;border-bottom:1px solid #e5e5e5;">${data.tasksCreated || '0'}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e5e5;"><strong>Active Projects</strong></td><td style="padding:8px;border-bottom:1px solid #e5e5e5;">${data.activeProjects || '0'}</td></tr>
        <tr><td style="padding:8px;"><strong>Habit Streaks</strong></td><td style="padding:8px;">${data.habitStreaks || '0'} active</td></tr>
      </table>
      ${data.highlights ? `<p><strong>Highlights:</strong> ${data.highlights}</p>` : ''}
      <p style="text-align:center;margin:24px 0;">
        <a href="${data.appUrl || 'http://localhost:5173'}/analytics" class="button">View Full Report</a>
      </p>
    `),
  },
};

export function renderTemplate(
  templateName: string,
  data: Record<string, string>
): { subject: string; html: string } | null {
  const template = emailTemplates[templateName];
  if (!template) return null;

  const subject = template.subject.replace(/\$\{(\w+)\}/g, (_, key) => data[key] || '');
  return { subject, html: template.html(data) };
}
