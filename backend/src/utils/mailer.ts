import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || 'no-reply@tamad.app';

export const sendMail = async (
  to: string, 
  subject: string, 
  html: string,
  fromName?: string,
  replyTo?: string
) => {
  if (!smtpHost || !smtpUser || !smtpPass) {
    return { ok: false, skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const fromHeader = fromName ? `"${fromName}" <${smtpFrom}>` : smtpFrom;

  return transporter.sendMail({ 
    from: fromHeader, 
    to, 
    subject, 
    html,
    replyTo 
  });
};
