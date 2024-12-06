import { ParsedCommand, CommandResult } from '../types/command';

const MIKROTIK_API_URL = import.meta.env.VITE_MIKROTIK_API_URL;
const MIKROTIK_API_KEY = import.meta.env.VITE_MIKROTIK_API_KEY;

interface MikrotikUnit {
  unitNumber: string;
  residentName: string;
  active: boolean;
  deactivationReason?: string;
  deactivatedBy?: string;
  deactivatedAt?: string;
}

export class MikrotikService {
  private static async makeRequest(endpoint: string, method: string, data?: any): Promise<Response> {
    const response = await fetch(`${MIKROTIK_API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MIKROTIK_API_KEY}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Mikrotik API error: ${response.statusText}`);
    }

    return response;
  }

  static async executeCommand(command: ParsedCommand): Promise<CommandResult> {
    try {
      const endpoint = command.type === 'DEACTIVATE_WIFI' ? '/deactivate' : '/activate';
      const response = await this.makeRequest(endpoint, 'POST', {
        unitNumber: command.unitNumber,
        userName: command.firstName && command.lastName 
          ? `${command.firstName} ${command.lastName}`
          : undefined,
        reason: command.reason,
      });

      const result = await response.json();

      return {
        status: 'success',
        message: `Successfully ${command.type === 'DEACTIVATE_WIFI' ? 'deactivated' : 'activated'} WiFi for Unit ${command.unitNumber}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Mikrotik execution error:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        timestamp: new Date().toISOString(),
      };
    }
  }

  static async getAllUnits(): Promise<MikrotikUnit[]> {
    try {
      const response = await this.makeRequest('/units', 'GET');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch units:', error);
      throw error;
    }
  }

  static async getStatus(unitNumber: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`/status/${unitNumber}`, 'GET');
      const { active } = await response.json();
      return active;
    } catch (error) {
      console.error('Failed to fetch status:', error);
      throw error;
    }
  }
}