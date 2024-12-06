import { Request, Response, NextFunction } from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { config } from '../config';
import { AppError } from '../utils/appError';

export const validateClerkToken = ClerkExpressRequireAuth({
  secretKey: config.clerk.secretKey
});

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.auth?.sessionClaims?.metadata?.role;
  
  if (userRole !== 'admin') {
    throw new AppError('Unauthorized - Admin access required', 403);
  }
  
  next();
};