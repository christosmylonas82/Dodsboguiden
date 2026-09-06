import type { Request, Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler.js';
import { sendContactEmail } from '../lib/email.js';

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
});

export async function submitContact(req: Request, res: Response) {
  const body = contactSchema.parse(req.body);

  const sent = await sendContactEmail(body.name, body.email, body.message);
  if (!sent) {
    throw new HttpError(500, 'Kunde inte skicka meddelandet. Försök igen senare.');
  }

  res.status(200).json({ success: true });
}
