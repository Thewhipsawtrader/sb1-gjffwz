import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { Error as ErrorModel } from '../models/Error';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { WhatsAppService } from '../services/whatsapp.service';
import { EmailService } from '../services/email.service';

const errorReportSchema = z.object({
  provider: z.enum(['MIKROTIK', 'WHATSAPP', 'EMAIL', 'CLERK', 'OTHER']),
  category: z.string(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  message: z.string(),
  stackTrace: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const reportError = asyncHandler(async (req: Request, res: Response) => {
  const errorData = errorReportSchema.parse(req.body);
  const { userId } = req.auth;

  logger.error('Error reported', {
    userId,
    error: errorData,
  });

  // Create error record
  const error = await ErrorModel.create(errorData);

  // Send notifications for high severity errors
  if (['HIGH', 'CRITICAL'].includes(errorData.severity)) {
    await Promise.all([
      WhatsAppService.getInstance().sendMessage(
        `🚨 ${errorData.severity} Error Reported\n` +
        `• Provider: ${errorData.provider}\n` +
        `• Category: ${errorData.category}\n` +
        `• Message: ${errorData.message}\n` +
        `• Reported by: ${userId}`
      ),
      EmailService.getInstance().sendErrorAlert({
        type: errorData.provider,
        severity: errorData.severity,
        message: errorData.message,
        stackTrace: errorData.stackTrace,
        metadata: errorData.metadata,
      }),
    ]);
  }

  res.status(201).json({
    status: 'success',
    data: error,
  });
});

export const getErrors = asyncHandler(async (req: Request, res: Response) => {
  const { 
    provider,
    severity,
    resolved,
    startDate,
    endDate,
    limit = '100',
  } = req.query;

  const query: Record<string, unknown> = {};

  if (provider) query.provider = provider;
  if (severity) query.severity = severity;
  if (resolved) query.resolved = resolved === 'true';
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate as string),
      $lte: new Date(endDate as string),
    };
  }

  const errors = await ErrorModel.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  res.json({
    status: 'success',
    data: errors,
  });
});

export const resolveError = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.auth;

  const error = await ErrorModel.findById(id);
  if (!error) {
    throw new AppError('Error not found', 404, 'ERROR_NOT_FOUND');
  }

  error.resolved = true;
  error.resolvedAt = new Date();
  error.resolvedBy = userId;
  await error.save();

  // Send notification
  await WhatsAppService.getInstance().sendMessage(
    `✅ Error Resolved\n` +
    `• Provider: ${error.provider}\n` +
    `• Category: ${error.category}\n` +
    `• Resolved by: ${userId}`
  );

  res.json({
    status: 'success',
    data: error,
  });
});

export const getErrorStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await ErrorModel.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        resolved: {
          $sum: { $cond: ['$resolved', 1, 0] },
        },
        byProvider: {
          $push: {
            provider: '$provider',
            severity: '$severity',
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
        resolved: 1,
        unresolved: { $subtract: ['$total', '$resolved'] },
        byProvider: {
          $reduce: {
            input: '$byProvider',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[
                    { 
                      k: '$$this.provider',
                      v: { $add: [{ $ifNull: ['$$value.$$this.provider', 0] }, 1] },
                    }
                  ]],
                },
              ],
            },
          },
        },
        bySeverity: {
          $reduce: {
            input: '$byProvider',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[
                    {
                      k: '$$this.severity',
                      v: { $add: [{ $ifNull: ['$$value.$$this.severity', 0] }, 1] },
                    }
                  ]],
                },
              ],
            },
          },
        },
      },
    },
  ]);

  res.json({
    status: 'success',
    data: stats[0] || {
      total: 0,
      resolved: 0,
      unresolved: 0,
      byProvider: {},
      bySeverity: {},
    },
  });
});