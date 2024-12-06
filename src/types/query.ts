export type QueryType = 'STATUS_CHECK' | 'HISTORY_CHECK';

export interface ParsedQuery {
  type: QueryType;
  unitNumber: string;
  firstName?: string;
  lastName?: string;
}

export interface WifiHistory {
  unitNumber: string;
  residentName: string;
  currentStatus: 'active' | 'deactivated';
  lastDeactivation?: {
    date: string;
    by: string;
    reason: string;
  };
  lastActivation?: {
    date: string;
    by: string;
  };
}