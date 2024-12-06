export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertCategory = 
  | 'SYSTEM_HEALTH'
  | 'SECURITY'
  | 'PERFORMANCE'
  | 'CONNECTIVITY'
  | 'USER_MANAGEMENT';

export interface Alert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  details?: Record<string, unknown>;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AlertReport {
  timestamp: string;
  reportType: 'MORNING' | 'MIDDAY' | 'EVENING';
  alerts: {
    critical: Alert[];
    high: Alert[];
    other: Alert[];
  };
  summary: {
    total: number;
    critical: number;
    high: number;
    resolved: number;
  };
}