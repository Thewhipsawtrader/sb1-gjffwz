import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { AppError } from '../utils/appError';
import { logger } from '../utils/logger';
import { config } from '../config';
import { Command } from '../models/Command';
import { User } from '../models/User';

// Input validation schemas
const commandSchema = z.object({
  type: z.enum(['ACTIVATE_WIFI', 'DEACTIVATE_WIFI']),
  unitNumber: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  reason: z.string().optional(),
});

const statusSchema = z.object({
  unitNumber: z.string(),
});

interface MikrotikResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

class MikrotikAPI {
  private static instance: MikrotikAPI;
  private readonly baseUrl: string;
  private readonly apiKey: string;

  private constructor() {
    this.baseUrl = config.mikrotikApi.url;
    this.apiKey = config.mikrotikApi.key;
  }

  static getInstance(): MikrotikAPI {
    if (!MikrotikAPI.instance) {
      MikrotikAPI.instance = new MikrotikAPI();
    }
    return MikrotikAPI.instance;
  }

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: unknown
  ): Promise<MikrotikResponse> {
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
          `Mikrotik API error: ${response.statusText}`,
          response.status,
          'MIKROTIK_API_ERROR'
        );
      }

      return await response.json();
    } catch (error) {
      logger.error('Mikrotik API request failed:', {
        endpoint,
        method,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async activateWiFi(unitNumber: string, metadata?: Record<string, unknown>): Promise<MikrotikResponse> {
    return this.makeRequest('/activate', 'POST', {
      unitNumber,
      metadata,
    });
  }

  async deactivateWiFi(unitNumber: string, metadata?: Record<string, unknown>): Promise<MikrotikResponse> {
    return this.makeRequest('/deactivate', 'POST', {
      unitNumber,
      metadata,
    });
  }

  async getStatus(unitNumber: string): Promise<MikrotikResponse> {
    return this.makeRequest(`/status/${unitNumber}`, 'GET');
  }

  async getUnitDetails(unitNumber: string): Promise<MikrotikResponse> {
    return this.makeRequest(`/units/${unitNumber}`, 'GET');
  }
}

export const executeCommand = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.auth;
  const commandData = commandSchema.parse(req.body);

  logger.info('Executing Mikrotik command', {
    userId,
    command: commandData,
  });

  // Create command record
  const command = await Command.create({
    ...commandData,
    executedBy: userId,
    status: 'PROCESSING',
  });

  try {
    // Get user details for metadata
    const user = await User.findOne({ unitNumber: commandData.unitNumber });
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const metadata = {
      commandId: command._id,
      executedBy: userId,
      userName: user.username,
      timestamp: new Date().toISOString(),
    };

    const mikrotik = MikrotikAPI.getInstance();
    let response: MikrotikResponse;

    if (commandData.type === 'ACTIVATE_WIFI') {
      response = await mikrotik.activateWiFi(commandData.unitNumber, metadata);
    } else {
      response = await mikrotik.deactivateWiFi(commandData.unitNumber, metadata);
    }

    // Update command status
    await Command.findByIdAndUpdate(command._id, {
      status: 'SUCCESS',
      completedAt: new Date(),
      metadata: {
        ...command.metadata,
        response: response.data,
      },
    });

    logger.info('Mikrotik command executed successfully', {
      commandId: command._id,
      response,
    });

    res.json({
      status: 'success',
      data: response.data,
      message: response.message,
    });
  } catch (error) {
    // Update command with error status
    await Command.findByIdAndUpdate(command._id, {
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date(),
    });

    logger.error('Mikrotik command execution failed', {
      commandId: command._id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
});

export const getStatus = asyncHandler(async (req: Request, res: Response) => {
  const { unitNumber } = statusSchema.parse(req.params);

  logger.info('Getting Mikrotik status', { unitNumber });

  const mikrotik = MikrotikAPI.getInstance();
  const response = await mikrotik.getStatus(unitNumber);

  res.json({
    status: 'success',
    data: response.data,
  });
});

export const getUnitDetails = asyncHandler(async (req: Request, res: Response) => {
  const { unitNumber } = statusSchema.parse(req.params);

  logger.info('Getting unit details', { unitNumber });

  const mikrotik = MikrotikAPI.getInstance();
  const response = await mikrotik.getUnitDetails(unitNumber);

  res.json({
    status: 'success',
    data: response.data,
  });
});