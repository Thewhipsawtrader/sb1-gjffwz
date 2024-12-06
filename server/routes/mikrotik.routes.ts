import { Router } from 'express';
import { executeCommand, getStatus, getUnitDetails } from '../controllers/mikrotik.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes (require authentication but not admin)
router.get('/status/:unitNumber', getStatus);
router.get('/units/:unitNumber', getUnitDetails);

// Protected routes (require admin)
router.post('/command', requireAdmin, executeCommand);

export { router as mikrotikRouter };