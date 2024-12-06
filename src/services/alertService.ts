import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertCategory, AlertSeverity, AlertReport } from '../types/alerts';
import { WhatsAppService } from './whatsapp';
import { EmailService } from './emailService';

export class AlertService {
  private static instance: AlertService;
  private alerts: Alert[] = [];
  private lastReportTime: Date = new Date();

  private constructor() {}

  static getInstance(): AlertService {
    if (!AlertService.instance) {
      AlertService.instance = new AlertService();
    }
    return AlertService.instance;
  }

  addAlert(
    category: AlertCategory,
    severity: AlertSeverity,
    message: string,
    details?: Record<string, unknown>
  ): Alert {
    const alert: Alert = {
      id: uuidv4(),
      category,
      severity,
      message,
      timestamp: new Date().toISOString(),
      details,
    };

    this.alerts.push(alert);

    // Only send immediate notification for specific critical situations
    if (this.requiresImmediateAttention(alert)) {
      this.sendImmediateNotification(alert);
    }

    return alert;
  }

  private requiresImmediateAttention(alert: Alert): boolean {
    // Define conditions for immediate notifications
    return (
      alert.severity === 'CRITICAL' &&
      (alert.category === 'SECURITY' || 
       alert.category === 'SYSTEM_HEALTH' ||
       (alert.category === 'CONNECTIVITY' && this.isExtendedOutage()))
    );
  }

  private isExtendedOutage(): boolean {
    const connectivityAlerts = this.alerts
      .filter(a => 
        a.category === 'CONNECTIVITY' && 
        !a.resolved &&
        new Date(a.timestamp).getTime() > Date.now() - 30 * 60 * 1000 // Last 30 minutes
      );
    return connectivityAlerts.length >= 3;
  }

  private async sendImmediateNotification(alert: Alert): Promise<void> {
    const message = this.formatAlertMessage(alert);
    
    try {
      await Promise.all([
        WhatsAppService.sendMessage(message),
        EmailService.sendTechnicalError(alert.severity, message)
      ]);
    } catch (error) {
      console.error('Failed to send immediate notification:', error);
    }
  }

  async generateReport(reportType: 'MORNING' | 'MIDDAY' | 'EVENING'): Promise<void> {
    const pendingAlerts = this.alerts.filter(
      alert => new Date(alert.timestamp) > this.lastReportTime
    );

    const report: AlertReport = {
      timestamp: new Date().toISOString(),
      reportType,
      alerts: {
        critical: pendingAlerts.filter(a => a.severity === 'CRITICAL'),
        high: pendingAlerts.filter(a => a.severity === 'HIGH'),
        other: pendingAlerts.filter(a => 
          a.severity !== 'CRITICAL' && a.severity !== 'HIGH'
        ),
      },
      summary: {
        total: pendingAlerts.length,
        critical: pendingAlerts.filter(a => a.severity === 'CRITICAL').length,
        high: pendingAlerts.filter(a => a.severity === 'HIGH').length,
        resolved: pendingAlerts.filter(a => a.resolved).length,
      },
    };

    if (report.summary.total > 0) {
      await this.sendReport(report);
    }

    this.lastReportTime = new Date();
  }

  private formatAlertMessage(alert: Alert): string {
    return `🚨 ${alert.severity} Alert: ${alert.category}\n\n` +
           `${alert.message}\n\n` +
           `Time: ${new Date(alert.timestamp).toLocaleString()}\n` +
           `${alert.details ? `Details: ${JSON.stringify(alert.details, null, 2)}` : ''}`;
  }

  private formatReport(report: AlertReport): string {
    const reportTypes = {
      'MORNING': '🌅 Morning Alert Report',
      'MIDDAY': '☀️ Midday Alert Report',
      'EVENING': '🌙 Evening Alert Report'
    };

    let message = `${reportTypes[report.reportType]}\n` +
                 `${new Date(report.timestamp).toLocaleString()}\n\n` +
                 `📊 Summary:\n` +
                 `• Total Alerts: ${report.summary.total}\n` +
                 `• Critical: ${report.summary.critical}\n` +
                 `• High Priority: ${report.summary.high}\n` +
                 `• Resolved: ${report.summary.resolved}\n\n`;

    if (report.alerts.critical.length > 0) {
      message += `⚠️ Critical Alerts:\n`;
      report.alerts.critical.forEach(alert => {
        message += this.formatAlertEntry(alert);
      });
    }

    if (report.alerts.high.length > 0) {
      message += `\n⚡ High Priority Alerts:\n`;
      report.alerts.high.forEach(alert => {
        message += this.formatAlertEntry(alert);
      });
    }

    if (report.alerts.other.length > 0) {
      message += `\n📝 Other Alerts:\n`;
      report.alerts.other.forEach(alert => {
        message += this.formatAlertEntry(alert);
      });
    }

    return message;
  }

  private formatAlertEntry(alert: Alert): string {
    return `• ${new Date(alert.timestamp).toLocaleTimeString()}: ${alert.message}\n` +
           `  ${alert.resolved ? '✅ Resolved' : '🔄 Pending'}\n`;
  }

  private async sendReport(report: AlertReport): Promise<void> {
    const message = this.formatReport(report);
    
    try {
      await Promise.all([
        WhatsAppService.sendMessage(message),
        EmailService.sendTechnicalError('HIGH', message)
      ]);
    } catch (error) {
      console.error('Failed to send alert report:', error);
    }
  }

  resolveAlert(alertId: string, resolvedBy: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = new Date().toISOString();
      alert.resolvedBy = resolvedBy;
    }
  }

  getUnresolvedAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  getAlertsByCategory(category: AlertCategory): Alert[] {
    return this.alerts.filter(alert => alert.category === category);
  }
}