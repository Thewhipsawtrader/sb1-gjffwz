import { DailyReport, DeactivatedUnit } from '../types/reports';
import { ReportEntry } from '../stores/reportStore';
import { env } from '../config/env';

interface WhatsAppConfig {
  apiUrl: string;
  apiKey: string;
  groupId: string;
}

export class WhatsAppService {
  private static config: WhatsAppConfig = {
    apiUrl: env.WHATSAPP_API_URL,
    apiKey: env.WHATSAPP_API_KEY,
    groupId: env.WHATSAPP_GROUP_ID,
  };

  private static async sendMessage(message: string): Promise<void> {
    try {
      const response = await fetch(`${this.config.apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          groupId: this.config.groupId,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }
    } catch (error) {
      console.error('WhatsApp notification error:', error);
      throw error;
    }
  }

  static async sendDailyReport(report: DailyReport): Promise<void> {
    const message = this.formatDailyReport(report);
    await this.sendMessage(message);
  }

  private static formatDailyReport(report: DailyReport): string {
    const { type, timestamp, requests, statusSummary } = report;
    const reportDate = new Date(timestamp).toLocaleDateString();
    
    let message = `📊 ${type}\n`;
    message += `📅 ${reportDate}\n\n`;

    // Status Summary
    message += `📈 Status Overview\n`;
    message += `• Total Units: ${statusSummary.totalUnits}\n`;
    message += `• Active Units: ${statusSummary.activeUnits}\n`;
    message += `• Deactivated Units: ${statusSummary.deactivatedUnits.length}\n\n`;

    // Recent Requests
    if (requests.length > 0) {
      message += `🔄 Recent Requests\n`;
      requests.forEach(request => {
        message += this.formatRequest(request);
      });
      message += '\n';
    }

    // Deactivated Units
    if (statusSummary.deactivatedUnits.length > 0) {
      message += `❌ Currently Deactivated Units\n`;
      statusSummary.deactivatedUnits.forEach(unit => {
        message += this.formatDeactivatedUnit(unit);
      });
    }

    return message;
  }

  private static formatRequest(request: ReportEntry): string {
    const action = request.command.type === 'DEACTIVATE_WIFI' ? '🔴' : '🟢';
    return `${action} Unit ${request.command.unitNumber}\n` +
           `• Resident: ${request.command.firstName} ${request.command.lastName}\n` +
           `• Action by: ${request.daName}\n` +
           `• Reason: ${request.command.reason}\n` +
           `• Time: ${new Date(request.timestamp).toLocaleString()}\n\n`;
  }

  private static formatDeactivatedUnit(unit: DeactivatedUnit): string {
    return `🏢 Unit ${unit.unitNumber}\n` +
           `• Resident: ${unit.residentName}\n` +
           `• Days Inactive: ${unit.daysDeactivated}\n` +
           `• Reason: ${unit.deactivationReason}\n` +
           `• Deactivated by: ${unit.deactivatedBy}\n\n`;
  }
}