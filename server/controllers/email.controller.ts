import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { EmailService } from '../services/email.service';
import { logger } from '../utils/logger';

const emailSchema = z.object({
  to: z.string().email(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string(),
  html: z.string(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
  })).optional(),
});

export const sendEmail = asyncHandler(async (req: Request, res: Response) => {
  const emailConfig = emailSchema.parse(req.body);
  const { userId } = req.auth;

  logger.info('Sending email', {
    userId,
    to: emailConfig.to,
    subject: emailConfig.subject,
  });

  await EmailService.getInstance().sendEmail(emailConfig);

  res.json({
    status: 'success',
    message: 'Email sent successfully',
  });
});