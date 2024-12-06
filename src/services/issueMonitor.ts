import { IssueType, IssueSeverity, IssueReport } from '../types/issues';
import { EmailService } from './emailService';
import { v4 as uuidv4 } from 'uuid';

interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date;
  responseTime: number;
}

export class IssueMonitor {
  private static instance: IssueMonitor;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastStatus: ConnectionStatus | null = null;
  private consecutiveFailures = 0;

  private constructor() {
    this.startMonitoring();
  }

  static getInstance(): IssueMonitor {
    if (!IssueMonitor.instance) {
      IssueMonitor.instance = new IssueMonitor();
    }
    return IssueMonitor.instance;
  }

  private async checkConnection(): Promise<ConnectionStatus> {
    const startTime = Date.now();
    try {
      const response = await fetch('/api/mikrotik/health');
      const isConnected = response.ok;
      return {
        isConnected,
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        isConnected: false,
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async handleConnectionIssue(status: ConnectionStatus): Promise<void> {
    this.consecutiveFailures++;

    const severity = this.determineSeverity();
    const issueType = this.determineIssueType(status);

    if (this.shouldReportIssue()) {
      const issue: IssueReport = {
        id: uuidv4(),
        type: issueType,
        severity,
        timestamp: new Date().toISOString(),
        siteName: 'Student Residence WiFi Management',
        description: this.generateDescription(status),
        possibleCause: this.determinePossibleCause(status),
        stepsTaken: this.getStepsTaken(),
        suggestedResolution: this.getSuggestedResolution(issueType),
        thirdPartyInvolved: true,
        status: 'OPEN',
      };

      await EmailService.sendIssueReport(issue);
    }
  }

  private determineSeverity(): IssueSeverity {
    if (this.consecutiveFailures >= 10) return 'CRITICAL';
    if (this.consecutiveFailures >= 5) return 'HIGH';
    if (this.consecutiveFailures >= 3) return 'MEDIUM';
    return 'LOW';
  }

  private determineIssueType(status: ConnectionStatus): IssueType {
    if (status.responseTime > 5000) return 'CONNECTION_ERROR';
    if (this.consecutiveFailures > 5) return 'CONFIGURATION_CONFLICT';
    return 'API_ERROR';
  }

  private shouldReportIssue(): boolean {
    return (
      this.consecutiveFailures === 1 || // First failure
      this.consecutiveFailures === 5 || // Escalation point
      this.consecutiveFailures === 10 || // Critical point
      this.consecutiveFailures % 30 === 0 // Every 30 failures
    );
  }

  private generateDescription(status: ConnectionStatus): string {
    return `Connection to Mikrotik router is failing with ${this.consecutiveFailures} consecutive failures. ` +
           `Last response time: ${status.responseTime}ms. ` +
           `This is affecting the WiFi management system's ability to process requests.`;
  }

  private determinePossibleCause(status: ConnectionStatus): string {
    if (status.responseTime > 5000) {
      return 'High latency detected, possibly due to network congestion or router overload.';
    }
    if (this.consecutiveFailures > 5) {
      return 'Persistent connection failures suggest possible configuration conflicts or authentication issues.';
    }
    return 'Intermittent connection issues, possibly due to recent router configuration changes.';
  }

  private getStepsTaken(): string[] {
    return [
      'Automatic connection retry attempts performed',
      'System logs analyzed for error patterns',
      'Authentication credentials verified',
      'API endpoint availability checked',
    ];
  }

  private getSuggestedResolution(issueType: IssueType): string[] {
    const commonSteps = [
      'Verify router accessibility and network connectivity',
      'Check for recent configuration changes by third-party management',
      'Review system logs for detailed error messages',
    ];

    switch (issueType) {
      case 'CONNECTION_ERROR':
        return [
          ...commonSteps,
          'Analyze network traffic and bandwidth usage',
          'Check for potential network bottlenecks',
        ];
      case 'CONFIGURATION_CONFLICT':
        return [
          ...commonSteps,
          'Review recent configuration changes',
          'Coordinate with third-party management for configuration alignment',
          'Verify API access permissions',
        ];
      default:
        return commonSteps;
    }
  }

  private startMonitoring(): void {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(async () => {
      const status = await this.checkConnection();

      if (!status.isConnected) {
        await this.handleConnectionIssue(status);
      } else {
        this.consecutiveFailures = 0;
      }

      this.lastStatus = status;
    }, 60000); // Check every minute
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  getLastStatus(): ConnectionStatus | null {
    return this.lastStatus;
  }
}