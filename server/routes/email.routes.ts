import { Router } from 'express';
import { sendEmail } from '../controllers/email.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Admin-only routes
router.post('/send', requireAdmin, sendEmail);

export { router as emailRouter };