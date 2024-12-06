export interface DeactivatedUnit {
  unitNumber: string;
  residentName: string;
  deactivationReason: string;
  deactivatedBy: string;
  deactivatedAt: string;
  daysDeactivated: number;
}

export interface StatusSummary {
  totalUnits: number;
  activeUnits: number;
  deactivatedUnits: DeactivatedUnit[];
}

export interface DailyReport {
  type: string;
  timestamp: string;
  requests: ReportEntry[];
  statusSummary: StatusSummary;
}