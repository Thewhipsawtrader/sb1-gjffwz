import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

export const UserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  unitNumber: z.string(),
  username: z.string(),
  role: z.enum(['admin', 'da']),
  clerkId: z.string(),
  active: z.boolean().default(true),
  lastLogin: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string(),
  updatedBy: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

export type UserType = z.infer<typeof UserSchema>;

interface UserDocument extends UserType, Document {}

const userSchema = new Schema<UserDocument>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    unitNumber: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'da'], required: true },
    clerkId: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
    lastLogin: Date,
    createdBy: { type: String, required: true },
    updatedBy: String,
    metadata: { type: Map, of: Schema.Types.Mixed }
  },
  {
    timestamps: true,
    collection: 'users'
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ clerkId: 1 }, { unique: true });
userSchema.index({ unitNumber: 1 });

export const User = mongoose.model<UserDocument>('User', userSchema);