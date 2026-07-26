import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { sendMail } from '../utils/mailer';

const router = Router();
const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false });
const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  country: z.string().regex(/^[A-Z]{2}$/),
  phoneNumber: z.string().regex(/^\+[1-9]\d{7,14}$/),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
});

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character);

router.post('/', contactLimiter, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Please check your contact details and try again.' });

  const { name, email, phoneNumber, subject, message } = parsed.data;
  const recipient = process.env.CONTACT_EMAIL || process.env.SMTP_FROM || 'support@tamad.app';
  await sendMail(recipient, `TaMaD contact request: ${subject}`, `<p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p><p><strong>Phone:</strong> ${escapeHtml(phoneNumber)}</p><p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>`);
  res.status(202).json({ message: 'Contact request received' });
});

export default router;
