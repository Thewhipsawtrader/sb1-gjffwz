import { Router } from 'express';
import { 
  createUser, 
  updateUser, 
  deleteUser, 
  getUsers, 
  getUserByUnit 
} from '../controllers/user.controller';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Admin-only routes
router.post('/', requireAdmin, createUser);
router.put('/:id', requireAdmin, updateUser);
router.delete('/:id', requireAdmin, deleteUser);
router.get('/', requireAdmin, getUsers);

// Public routes (require authentication)
router.get('/unit/:unitNumber', getUserByUnit);

export { router as userRouter };