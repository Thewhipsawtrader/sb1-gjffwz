import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

export const ReportSchema = z.object({
  type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  provider: z.enum(['MIKROTIK', 'WHATSAPP', 'EMAIL', 'CLERK', 'OTHER']),
  period: z.object({
    startDate: z.date(),
    endDate: z.date()
  }),
  summary: z.object({
    totalErrors: z.number(),
    totalCost: z.number(),
    errorsByCategory: z.record(z.number()),
    errorsBySeverity: z.record(z.number()),
    resolvedErrors: z.number()
  }),
  details: z.array(z.object({
    errorId: z.string(),
    message: z.string(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    timestamp: z.date()
  })),
  billing: z.object({
    totalAmount: z.number(),
    breakdown: z.array(z.object({
      tier: z.string(),
      errors: z.number(),
      rate: z.number(),
      cost: z.number()
    }))
  }),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type ReportType = z.infer<typeof ReportSchema>;

interface ReportDocument extends ReportType, Document {}

const reportSchema = new Schema<ReportDocument>(
  {
    type: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
      required: true
    },
    provider: {
      type: String,
      enum: ['MIKROTIK', 'WHATSAPP', 'EMAIL', 'CLERK', 'OTHER'],
      required: true
    },
    period: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true }
    },
    summary: {
      totalErrors: { type: Number, required: true },
      totalCost: { type: Number, required: true },
      errorsByCategory: { type: Map, of: Number },
      errorsBySeverity: { type: Map, of: Number },
      resolvedErrors: { type: Number, required: true }
    },
    details: [{
      errorId: { type: String, required: true },
      message: { type: String, required: true },
      severity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        required: true
      },
      timestamp: { type: Date, required: true }
    }],
    billing: {
      totalAmount: { type: Number, required: true },
      breakdown: [{
        tier: { type: String, required: true },
        errors: { type: Number, required: true },
        rate: { type: Number, required: true },
        cost: { type: Number, required: true }
      }]
    },
    metadata: { type: Map, of: Schema.Types.Mixed }
  },
  {
    timestamps: true,
    collection: 'reports'
  }
);

reportSchema.index({ type: 1, provider: 1, 'period.startDate': 1 });
reportSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
reportSchema.index({ provider: 1, createdAt: -1 });

export const Report = mongoose.model<ReportDocument>('Report', reportSchema);