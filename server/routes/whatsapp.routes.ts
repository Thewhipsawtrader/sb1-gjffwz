import { Router } from 'express';
import { sendMessage, sendDARequest, sendDailyReport } from '../controllers/whatsapp.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Protected routes (require authentication)
router.post('/messages', sendMessage);
router.post('/da-request', sendDARequest);

// Admin-only routes
router.post('/daily-report', requireAdmin, sendDailyReport);

export { router as whatsappRouter };