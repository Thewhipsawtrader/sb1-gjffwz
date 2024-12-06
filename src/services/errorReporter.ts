import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/clerk-react';
import { 
  ErrorCategory, 
  ErrorSeverity, 
  TechnicalError, 
  ErrorContext 
} from '../types/errors';
import { EmailService } from './emailService';

export class ErrorReporter {
  private static instance: ErrorReporter;
  private readonly maxStoredErrors = 100;
  private errors: TechnicalError[] = [];

  private constructor() {
    this.setupGlobalHandlers();
  }

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  private setupGlobalHandlers(): void {
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        category: 'SYSTEM_ERROR',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        severity: 'HIGH',
        context: {
          action: 'UNHANDLED_REJECTION',
        },
        stackTrace: event.reason?.stack,
      });
    });
  }

  private determineSeverity(error: Error, category: ErrorCategory): ErrorSeverity {
    if (category === 'AUTHENTICATION_ERROR' || category === 'DATABASE_ERROR') {
      return 'HIGH';
    }
    if (error.message.includes('timeout') || error.message.includes('network')) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  async reportError({
    category,
    message,
    severity,
    context,
    stackTrace,
    code,
    affectedUsers,
    affectedProcesses,
  }: {
    category: ErrorCategory;
    message: string;
    severity?: ErrorSeverity;
    context?: ErrorContext;
    stackTrace?: string;
    code?: string;
    affectedUsers?: string[];
    affectedProcesses?: string[];
  }): Promise<void> {
    const error: TechnicalError = {
      id: uuidv4(),
      category,
      severity: severity || this.determineSeverity(new Error(message), category),
      timestamp: new Date().toISOString(),
      message,
      code,
      context: {
        ...context,
        requestId: uuidv4(),
      },
      stackTrace,
      affectedUsers,
      affectedProcesses,
      status: 'NEW',
    };

    this.errors = [error, ...this.errors.slice(0, this.maxStoredErrors - 1)];
    await this.notifyError(error);
  }

  private async notifyError(error: TechnicalError): Promise<void> {
    try {
      const emailBody = this.formatErrorEmail(error);
      await EmailService.sendTechnicalError(error.severity, emailBody);
    } catch (emailError) {
      console.error('Failed to send error notification:', emailError);
    }
  }

  private formatErrorEmail(error: TechnicalError): string {
    return `
Dear Support Team,

A technical error has been detected in the system. Below are the details:

Error ID: ${error.id}
Category: ${error.category.replace(/_/g, ' ')}
Severity: ${error.severity}
Timestamp: ${new Date(error.timestamp).toLocaleString()}
${error.code ? `Error Code: ${error.code}\n` : ''}

Message:
${error.message}

Context:
${Object.entries(error.context)
  .filter(([_, value]) => value !== undefined)
  .map(([key, value]) => `• ${key}: ${value}`)
  .join('\n')}

${error.affectedUsers?.length ? `
Affected Users:
${error.affectedUsers.map(user => `• ${user}`).join('\n')}
` : ''}

${error.affectedProcesses?.length ? `
Affected Processes:
${error.affectedProcesses.map(process => `• ${process}`).join('\n')}
` : ''}

${error.stackTrace ? `
Stack Trace:
${error.stackTrace}
` : ''}

Please investigate and resolve this issue as soon as possible.

Best Regards,
Surelink Support Team
    `.trim();
  }

  getRecentErrors(): TechnicalError[] {
    return this.errors;
  }

  clearErrors(): void {
    this.errors = [];
  }
}