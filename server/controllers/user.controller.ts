import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { User, UserSchema } from '../models/User';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { WhatsAppService } from '../services/whatsapp.service';

// Input validation schemas
const createUserSchema = UserSchema.omit({ 
  createdAt: true, 
  updatedAt: true 
});

const updateUserSchema = UserSchema.partial().omit({ 
  createdAt: true, 
  updatedAt: true 
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const userData = createUserSchema.parse(req.body);
  const { userId } = req.auth;

  logger.info('Creating new user', {
    adminId: userId,
    userData: {
      email: userData.email,
      unitNumber: userData.unitNumber,
      role: userData.role,
    },
  });

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email: userData.email },
      { username: userData.username },
      { clerkId: userData.clerkId },
    ],
  });

  if (existingUser) {
    throw new AppError('User already exists', 400, 'USER_EXISTS');
  }

  // Create user
  const user = await User.create({
    ...userData,
    createdBy: userId,
  });

  // Send WhatsApp notification
  await WhatsAppService.getInstance().sendMessage(
    `🆕 New User Added\n` +
    `• Name: ${user.firstName} ${user.lastName}\n` +
    `• Unit: ${user.unitNumber}\n` +
    `• Role: ${user.role}\n` +
    `• Added by: ${userId}`
  );

  res.status(201).json({
    status: 'success',
    data: user,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = updateUserSchema.parse(req.body);
  const { userId } = req.auth;

  logger.info('Updating user', {
    adminId: userId,
    userId: id,
    updateData,
  });

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Check if email or username is being changed and is unique
  if (updateData.email || updateData.username) {
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: id } },
        {
          $or: [
            { email: updateData.email },
            { username: updateData.username },
          ],
        },
      ],
    });

    if (existingUser) {
      throw new AppError(
        'Email or username already in use',
        400,
        'DUPLICATE_USER'
      );
    }
  }

  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      ...updateData,
      updatedBy: userId,
    },
    { new: true, runValidators: true }
  );

  // Send WhatsApp notification for significant changes
  if (updateData.role || updateData.unitNumber || updateData.active !== undefined) {
    await WhatsAppService.getInstance().sendMessage(
      `📝 User Updated\n` +
      `• Name: ${updatedUser.firstName} ${updatedUser.lastName}\n` +
      `• Changes: ${Object.keys(updateData).join(', ')}\n` +
      `• Updated by: ${userId}`
    );
  }

  res.json({
    status: 'success',
    data: updatedUser,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.auth;

  logger.info('Deleting user', {
    adminId: userId,
    userId: id,
  });

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  await User.findByIdAndDelete(id);

  // Send WhatsApp notification
  await WhatsAppService.getInstance().sendMessage(
    `❌ User Deleted\n` +
    `• Name: ${user.firstName} ${user.lastName}\n` +
    `• Unit: ${user.unitNumber}\n` +
    `• Deleted by: ${userId}`
  );

  res.json({
    status: 'success',
    message: 'User deleted successfully',
  });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.json({
    status: 'success',
    data: users,
  });
});

export const getUserByUnit = asyncHandler(async (req: Request, res: Response) => {
  const { unitNumber } = req.params;

  const user = await User.findOne({ unitNumber });
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({
    status: 'success',
    data: user,
  });
});