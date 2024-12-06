import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

export const CommandSchema = z.object({
  type: z.enum(['ACTIVATE_WIFI', 'DEACTIVATE_WIFI']),
  unitNumber: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  reason: z.string().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'SUCCESS', 'ERROR']),
  executedBy: z.string(),
  error: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional()
});

export type CommandType = z.infer<typeof CommandSchema>;

interface CommandDocument extends CommandType, Document {}

const commandSchema = new Schema<CommandDocument>(
  {
    type: {
      type: String,
      enum: ['ACTIVATE_WIFI', 'DEACTIVATE_WIFI'],
      required: true
    },
    unitNumber: { type: String, required: true },
    firstName: String,
    lastName: String,
    reason: String,
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'ERROR'],
      required: true,
      default: 'PENDING'
    },
    executedBy: { type: String, required: true },
    error: String,
    metadata: { type: Map, of: Schema.Types.Mixed },
    completedAt: Date
  },
  {
    timestamps: true,
    collection: 'commands'
  }
);

commandSchema.index({ unitNumber: 1, createdAt: -1 });
commandSchema.index({ status: 1 });
commandSchema.index({ executedBy: 1 });
commandSchema.index({ type: 1, status: 1 });

export const Command = mongoose.model<CommandDocument>('Command', commandSchema);