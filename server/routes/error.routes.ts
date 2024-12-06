import { Router } from 'express';
import {
  reportError,
  getErrors,
  resolveError,
  getErrorStats,
} from '../controllers/error.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Admin-only routes
router.get('/', requireAdmin, getErrors);
router.get('/stats', requireAdmin, getErrorStats);
router.patch('/:id/resolve', requireAdmin, resolveError);

// Public routes (require authentication)
router.post('/report', reportError);

export { router as errorRouter };