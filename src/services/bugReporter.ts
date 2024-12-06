import { BugReport, BugSeverity } from '../types/bugs';
import { EmailService } from './emailService';
import { v4 as uuidv4 } from 'uuid';

export class BugReporter {
  private static instance: BugReporter;
  private readonly maxStoredErrors = 50;
  private errors: BugReport[] = [];

  private constructor() {
    this.setupErrorListeners();
  }

  static getInstance(): BugReporter {
    if (!BugReporter.instance) {
      BugReporter.instance = new BugReporter();
    }
    return BugReporter.instance;
  }

  private setupErrorListeners(): void {
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'RUNTIME');
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'PROMISE');
    });
  }

  private determineSeverity(error: Error): BugSeverity {
    if (error.message.includes('network') || error.message.includes('API')) {
      return 'HIGH';
    }
    if (error.message.includes('undefined') || error.message.includes('null')) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  private async handleError(
    error: Error,
    type: string,
    component?: string,
    userAction?: string
  ): Promise<void> {
    const bugReport: BugReport = {
      id: uuidv4(),
      type,
      severity: this.determineSeverity(error),
      timestamp: new Date().toISOString(),
      component: component || 'Unknown',
      description: error.message,
      userAgent: navigator.userAgent,
      stackTrace: error.stack,
      userAction,
      status: 'NEW',
    };

    this.errors = [bugReport, ...this.errors.slice(0, this.maxStoredErrors - 1)];
    await this.reportBug(bugReport);
  }

  private async reportBug(bug: BugReport): Promise<void> {
    try {
      const emailBody = this.formatBugEmail(bug);
      await EmailService.sendBugReport(bug.severity, emailBody);
    } catch (error) {
      console.error('Failed to send bug report:', error);
    }
  }

  private formatBugEmail(bug: BugReport): string {
    return `
Dear Support Team,

A bug has been detected on the DA Portal website. Below are the details:

Bug ID: ${bug.id}
Severity: ${bug.severity}
Type: ${bug.type}
Component: ${bug.component}
Timestamp: ${new Date(bug.timestamp).toLocaleString()}

Description:
${bug.description}

${bug.userAction ? `User Action:\n${bug.userAction}\n` : ''}

Technical Details:
- Browser: ${bug.userAgent}
${bug.stackTrace ? `- Stack Trace:\n${bug.stackTrace}` : ''}

Please investigate this issue at your earliest convenience.

Best Regards,
Surelink Support Team
    `.trim();
  }

  reportUIError(
    component: string,
    error: Error,
    userAction?: string
  ): void {
    this.handleError(error, 'UI', component, userAction);
  }

  reportAPIError(
    endpoint: string,
    error: Error,
    userAction?: string
  ): void {
    this.handleError(error, 'API', endpoint, userAction);
  }

  getRecentErrors(): BugReport[] {
    return this.errors;
  }
}