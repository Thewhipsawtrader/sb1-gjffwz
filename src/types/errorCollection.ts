export type ThirdPartyIdentifier = 'MIKROTIK' | 'WHATSAPP' | 'EMAIL' | 'CLERK' | 'OTHER';

export interface ErrorStats {
  total: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  resolution: {
    resolved: number;
    pending: number;
  };
}

export interface ThirdPartyError {
  id: string;
  provider: ThirdPartyIdentifier;
  timestamp: string;
  category: string;
  severity: string;
  message: string;
  stackTrace?: string;
  resolved: boolean;
  resolvedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorReport {
  startDate: string;
  endDate: string;
  providers: Record<ThirdPartyIdentifier, ErrorStats>;
  errors: ThirdPartyError[];
}