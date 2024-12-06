import { v4 as uuidv4 } from 'uuid';
import { 
  ThirdPartyIdentifier, 
  ThirdPartyError, 
  ErrorStats, 
  ErrorReport 
} from '../types/errorCollection';
import { ErrorReporter } from './errorReporter';

export class ErrorCollectionService {
  private static instance: ErrorCollectionService;
  private errors: ThirdPartyError[] = [];

  private constructor() {
    this.setupErrorListeners();
  }

  static getInstance(): ErrorCollectionService {
    if (!ErrorCollectionService.instance) {
      ErrorCollectionService.instance = new ErrorCollectionService();
    }
    return ErrorCollectionService.instance;
  }

  private setupErrorListeners(): void {
    ErrorReporter.getInstance().onError((error) => {
      this.addError({
        provider: this.determineProvider(error),
        category: error.category,
        severity: error.severity,
        message: error.message,
        stackTrace: error.stackTrace,
        metadata: error.context,
      });
    });
  }

  private determineProvider(error: any): ThirdPartyIdentifier {
    const message = error.message.toLowerCase();
    const stack = error.stackTrace?.toLowerCase() || '';

    if (message.includes('mikrotik') || stack.includes('mikrotik')) {
      return 'MIKROTIK';
    }
    if (message.includes('whatsapp') || stack.includes('whatsapp')) {
      return 'WHATSAPP';
    }
    if (message.includes('email') || stack.includes('email')) {
      return 'EMAIL';
    }
    if (message.includes('clerk') || stack.includes('clerk')) {
      return 'CLERK';
    }
    return 'OTHER';
  }

  addError({
    provider,
    category,
    severity,
    message,
    stackTrace,
    metadata,
  }: {
    provider: ThirdPartyIdentifier;
    category: string;
    severity: string;
    message: string;
    stackTrace?: string;
    metadata?: Record<string, unknown>;
  }): void {
    const error: ThirdPartyError = {
      id: uuidv4(),
      provider,
      timestamp: new Date().toISOString(),
      category,
      severity,
      message,
      stackTrace,
      resolved: false,
      metadata,
    };

    this.errors.push(error);
  }

  getErrorReport(startDate: Date, endDate: Date): ErrorReport {
    const filteredErrors = this.errors.filter(error => {
      const errorDate = new Date(error.timestamp);
      return errorDate >= startDate && errorDate <= endDate;
    });

    const providers: Record<ThirdPartyIdentifier, ErrorStats> = {
      MIKROTIK: this.calculateStats(filteredErrors, 'MIKROTIK'),
      WHATSAPP: this.calculateStats(filteredErrors, 'WHATSAPP'),
      EMAIL: this.calculateStats(filteredErrors, 'EMAIL'),
      CLERK: this.calculateStats(filteredErrors, 'CLERK'),
      OTHER: this.calculateStats(filteredErrors, 'OTHER'),
    };

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      providers,
      errors: filteredErrors,
    };
  }

  private calculateStats(errors: ThirdPartyError[], provider: ThirdPartyIdentifier): ErrorStats {
    const providerErrors = errors.filter(error => error.provider === provider);

    const categories = new Map<string, number>();
    const severities = new Map<string, number>();
    let resolved = 0;

    providerErrors.forEach(error => {
      // Count by category
      categories.set(
        error.category,
        (categories.get(error.category) || 0) + 1
      );

      // Count by severity
      severities.set(
        error.severity,
        (severities.get(error.severity) || 0) + 1
      );

      // Count resolved
      if (error.resolved) {
        resolved++;
      }
    });

    return {
      total: providerErrors.length,
      byCategory: Object.fromEntries(categories),
      bySeverity: Object.fromEntries(severities),
      resolution: {
        resolved,
        pending: providerErrors.length - resolved,
      },
    };
  }

  getMonthlyReport(year: number, month: number): ErrorReport {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return this.getErrorReport(startDate, endDate);
  }

  resolveError(errorId: string): void {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.resolved = true;
      error.resolvedAt = new Date().toISOString();
    }
  }

  getErrorsByProvider(provider: ThirdPartyIdentifier): ThirdPartyError[] {
    return this.errors.filter(error => error.provider === provider);
  }

  getUnresolvedErrors(): ThirdPartyError[] {
    return this.errors.filter(error => !error.resolved);
  }

  clearOldErrors(daysToKeep: number): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    this.errors = this.errors.filter(error => 
      new Date(error.timestamp) > cutoffDate
    );
  }
}