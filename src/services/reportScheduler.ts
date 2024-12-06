import { WhatsAppService } from './whatsapp';
import { MikrotikService } from './mikrotik';
import { ReportStore } from '../stores/reportStore';
import { AlertService } from './alertService';
import { DailyReport } from '../types/reports';

export class ReportScheduler {
  private static schedules = [
    { hour: 8, minute: 0, name: 'Opening Report', type: 'MORNING' },
    { hour: 12, minute: 0, name: 'Midday Report', type: 'MIDDAY' },
    { hour: 18, minute: 0, name: 'Closing Report', type: 'EVENING' },
  ];

  static initialize(): void {
    this.schedules.forEach(schedule => {
      this.scheduleReport(schedule.hour, schedule.minute, schedule.name, schedule.type);
    });
  }

  private static scheduleReport(
    hour: number, 
    minute: number, 
    reportName: string,
    reportType: 'MORNING' | 'MIDDAY' | 'EVENING'
  ): void {
    setInterval(() => {
      const now = new Date();
      if (now.getHours() === hour && now.getMinutes() === minute) {
        this.generateAndSendReport(reportName, reportType);
      }
    }, 60000); // Check every minute
  }

  private static async generateAndSendReport(
    reportName: string,
    reportType: 'MORNING' | 'MIDDAY' | 'EVENING'
  ): Promise<void> {
    try {
      // Generate alert report
      await AlertService.getInstance().generateReport(reportType);

      // Get all requests since last report
      const requests = ReportStore.getRequestsSinceLastReport();
      
      // Get current status of all units
      const statusReport = await this.generateStatusReport();

      // Generate the daily report
      const report: DailyReport = {
        type: reportName,
        timestamp: new Date().toISOString(),
        requests,
        statusSummary: statusReport,
      };

      // Send the daily report
      await WhatsAppService.sendDailyReport(report);

      // Clear processed requests
      ReportStore.clearRequests();
    } catch (error) {
      console.error(`Failed to generate ${reportName}:`, error);
    }
  }

  private static async generateStatusReport(): Promise<StatusSummary> {
    const units = await MikrotikService.getAllUnits();
    const deactivatedUnits = units.filter(unit => !unit.active);
    
    return {
      totalUnits: units.length,
      activeUnits: units.length - deactivatedUnits.length,
      deactivatedUnits: deactivatedUnits.map(unit => ({
        unitNumber: unit.unitNumber,
        residentName: unit.residentName,
        deactivationReason: unit.deactivationReason,
        deactivatedBy: unit.deactivatedBy,
        deactivatedAt: unit.deactivatedAt,
        daysDeactivated: Math.floor(
          (Date.now() - new Date(unit.deactivatedAt).getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
    };
  }
}