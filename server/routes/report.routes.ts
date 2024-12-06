import { Router } from 'express';
import {
  generateDailyReport,
  generateMonthlyReport,
  getReportHistory,
  getReportById,
} from '../controllers/report.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Admin-only routes
router.post('/daily', requireAdmin, generateDailyReport);
router.post('/monthly', requireAdmin, generateMonthlyReport);
router.get('/history', requireAdmin, getReportHistory);
router.get('/:id', requireAdmin, getReportById);

export { router as reportRouter };