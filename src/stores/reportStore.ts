import { ParsedCommand } from '../types/command';

export interface ReportEntry {
  command: ParsedCommand;
  daName: string;
  timestamp: string;
}

class ReportStoreClass {
  private requests: ReportEntry[] = [];
  private lastReportTime: Date = new Date();

  addRequest(entry: ReportEntry): void {
    this.requests.push(entry);
  }

  getRequestsSinceLastReport(): ReportEntry[] {
    return this.requests;
  }

  clearRequests(): void {
    this.requests = [];
    this.lastReportTime = new Date();
  }
}

export const ReportStore = new ReportStoreClass();