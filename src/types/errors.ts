export type ErrorCategory = 
  | 'API_ERROR' 
  | 'SYSTEM_ERROR' 
  | 'DATABASE_ERROR' 
  | 'NETWORK_ERROR' 
  | 'AUTHENTICATION_ERROR'
  | 'PERMISSION_ERROR'
  | 'VALIDATION_ERROR'
  | 'INTEGRATION_ERROR';

export type ErrorSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ErrorContext {
  userId?: string;
  userRole?: string;
  requestId?: string;
  endpoint?: string;
  action?: string;
  input?: unknown;
}

export interface TechnicalError {
  id: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  timestamp: string;
  message: string;
  code?: string;
  context: ErrorContext;
  stackTrace?: string;
  affectedUsers?: string[];
  affectedProcesses?: string[];
  status: 'NEW' | 'INVESTIGATING' | 'RESOLVED';
}