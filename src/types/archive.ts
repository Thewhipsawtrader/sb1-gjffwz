export interface ArchivedReport {
  id: string;
  provider: string;
  year: number;
  month: number;
  fileName: string;
  fileSize: number;
  createdAt: string;
  reportData: unknown;
  metadata: {
    totalErrors: number;
    totalCost: number;
    generatedBy: string;
    version: string;
  };
}

export interface ArchiveStats {
  totalReports: number;
  totalSize: number;
  oldestReport: string;
  latestReport: string;
  reportsByProvider: Record<string, number>;
}