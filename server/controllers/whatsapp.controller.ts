import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { config } from '../config';
import { Message } from '../models/Message';
import { rateLimit } from 'express-rate-limit';

// Input validation schemas
const messageSchema = z.object({
  content: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('LOW'),
  metadata: z.record(z.unknown()).optional(),
});

interface WhatsAppResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

class WhatsAppAPI {
  private static instance: WhatsAppAPI;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly groupId: string;
  private readonly rateLimiter: ReturnType<typeof rateLimit>;

  private constructor() {
    this.baseUrl = config.whatsappApi.url;
    this.apiKey = config.whatsappApi.key;
    this.groupId = config.whatsappApi.groupId;

    // Initialize rate limiter
    this.rateLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 30, // 30 messages per minute
      message: 'Too many messages sent. Please try again later.',
    });
  }

  static getInstance(): WhatsAppAPI {
    if (!WhatsAppAPI.instance) {
      WhatsAppAPI.instance = new WhatsAppAPI();
    }
    return WhatsAppAPI.instance;
  }

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST',
    data?: unknown
  ): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new AppError(
          `WhatsApp API error: ${response.statusText}`,
          response.status,
          'WHATSAPP_API_ERROR'
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('WhatsApp API request failed:', {
        endpoint,
        method,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async sendMessage(content: string, metadata?: Record<string, unknown>): Promise<WhatsAppResponse> {
    return this.makeRequest('/messages', 'POST', {
      groupId: this.groupId,
      content,
      metadata,
    });
  }

  async sendFormattedMessage(
    title: string,
    content: string[],
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW'
  ): Promise<WhatsAppResponse> {
    const priorityEmojis = {
      LOW: '📝',
      MEDIUM: '⚠️',
      HIGH: '🚨',
      CRITICAL: '🔥',
    };

    const formattedMessage = [
      `${priorityEmojis[priority]} *${title}*`,
      '',
      ...content,
      '',
      `_Sent at: ${new Date().toLocaleString()}_`,
    ].join('\n');

    return this.sendMessage(formattedMessage, { priority });
  }

  async sendDARequest(
    command: string,
    unitNumber: string,
    daName: string,
    reason?: string
  ): Promise<WhatsAppResponse> {
    const content = [
      `*DA Request*`,
      ``,
      `👤 *DA:* ${daName}`,
      `🏢 *Unit:* ${unitNumber}`,
      `📋 *Command:* ${command}`,
      reason ? `📝 *Reason:* ${reason}` : '',
      ``,
      `_Sent at: ${new Date().toLocaleString()}_`,
    ].filter(Boolean).join('\n');

    return this.sendMessage(content, {
      type: 'DA_REQUEST',
      unitNumber,
      daName,
      command,
    });
  }

  async sendDailyReport(
    activeUnits: number,
    deactivatedUnits: number,
    requests: Array<{
      type: string;
      unitNumber: string;
      daName: string;
      timestamp: string;
    }>
  ): Promise<WhatsAppResponse> {
    const content = [
      `*Daily WiFi Status Report*`,
      ``,
      `📊 *Summary*`,
      `✅ Active Units: ${activeUnits}`,
      `❌ Deactivated Units: ${deactivatedUnits}`,
      ``,
      `📝 *Recent Requests*`,
      ...requests.map(req => 
        `• ${req.type === 'DEACTIVATE_WIFI' ? '🔴' : '🟢'} Unit ${req.unitNumber} - ${req.daName}`
      ),
      ``,
      `_Generated at: ${new Date().toLocaleString()}_`,
    ].join('\n');

    return this.sendMessage(content, {
      type: 'DAILY_REPORT',
      timestamp: new Date().toISOString(),
    });
  }
}

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { content, priority, metadata } = messageSchema.parse(req.body);
  const { userId } = req.auth;

  logger.info('Sending WhatsApp message', {
    userId,
    priority,
  });

  try {
    const whatsapp = WhatsAppAPI.getInstance();
    const response = await whatsapp.sendFormattedMessage(
      'System Notification',
      [content],
      priority
    );

    // Store message in database
    await Message.create({
      content,
      priority,
      metadata,
      sentBy: userId,
      messageId: response.messageId,
      status: 'SENT',
    });

    res.json({
      status: 'success',
      data: response,
    });
  } catch (error) {
    // Store failed message attempt
    await Message.create({
      content,
      priority,
      metadata,
      sentBy: userId,
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
});

export const sendDARequest = asyncHandler(async (req: Request, res: Response) => {
  const { command, unitNumber, reason } = z.object({
    command: z.string(),
    unitNumber: z.string(),
    reason: z.string().optional(),
  }).parse(req.body);

  const { userId } = req.auth;
  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const daName = `${user.firstName} ${user.lastName}`;

  logger.info('Sending DA request notification', {
    userId,
    command,
    unitNumber,
  });

  const whatsapp = WhatsAppAPI.getInstance();
  const response = await whatsapp.sendDARequest(
    command,
    unitNumber,
    daName,
    reason
  );

  res.json({
    status: 'success',
    data: response,
  });
});

export const sendDailyReport = asyncHandler(async (req: Request, res: Response) => {
  const { activeUnits, deactivatedUnits, requests } = z.object({
    activeUnits: z.number(),
    deactivatedUnits: z.number(),
    requests: z.array(z.object({
      type: z.string(),
      unitNumber: z.string(),
      daName: z.string(),
      timestamp: z.string(),
    })),
  }).parse(req.body);

  logger.info('Sending daily report');

  const whatsapp = WhatsAppAPI.getInstance();
  const response = await whatsapp.sendDailyReport(
    activeUnits,
    deactivatedUnits,
    requests
  );

  res.json({
    status: 'success',
    data: response,
  });
});