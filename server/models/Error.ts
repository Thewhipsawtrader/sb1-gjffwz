import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

export const ErrorSchema = z.object({
  provider: z.enum(['MIKROTIK', 'WHATSAPP', 'EMAIL', 'CLERK', 'OTHER']),
  category: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  message: z.string(),
  stackTrace: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  resolved: z.boolean().default(false),
  resolvedAt: z.date().optional(),
  resolvedBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type ErrorType = z.infer<typeof ErrorSchema>;

interface ErrorDocument extends ErrorType, Document {}

const errorSchema = new Schema<ErrorDocument>(
  {
    provider: {
      type: String,
      enum: ['MIKROTIK', 'WHATSAPP', 'EMAIL', 'CLERK', 'OTHER'],
      required: true
    },
    category: { type: String, required: true },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true
    },
    message: { type: String, required: true },
    stackTrace: String,
    metadata: { type: Map, of: Schema.Types.Mixed },
    resolved: { type: Boolean, default: false },
    resolvedAt: Date,
    resolvedBy: String
  },
  {
    timestamps: true,
    collection: 'errors'
  }
);

errorSchema.index({ provider: 1, createdAt: -1 });
errorSchema.index({ severity: 1 });
errorSchema.index({ resolved: 1 });
errorSchema.index({ category: 1 });

export const Error = mongoose.model<ErrorDocument>('Error', errorSchema);