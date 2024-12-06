export type BugSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface BugReport {
  id: string;
  type: string;
  severity: BugSeverity;
  timestamp: string;
  component: string;
  description: string;
  userAgent: string;
  stepsToReproduce?: string[];
  stackTrace?: string;
  userAction?: string;
  status: 'NEW' | 'INVESTIGATING' | 'FIXED';
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}