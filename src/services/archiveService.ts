import { v4 as uuidv4 } from 'uuid';
import { ArchivedReport, ArchiveStats } from '../types/archive';
import { MonthlyErrorSummary } from '../types/monthlyReport';
import { ThirdPartyIdentifier } from '../types/errorCollection';

export class ArchiveService {
  private static instance: ArchiveService;
  private archives: Map<string, ArchivedReport> = new Map();
  private readonly VERSION = '1.0.0';

  private constructor() {}

  static getInstance(): ArchiveService {
    if (!ArchiveService.instance) {
      ArchiveService.instance = new ArchiveService();
    }
    return ArchiveService.instance;
  }

  async archiveReport(
    provider: ThirdPartyIdentifier,
    report: MonthlyErrorSummary,
    generatedBy: string
  ): Promise<ArchivedReport> {
    const reportDate = new Date(report.period.startDate);
    const year = reportDate.getFullYear();
    const month = reportDate.getMonth() + 1;

    const fileName = this.generateFileName(provider, year, month);
    const reportJson = JSON.stringify(report, null, 2);

    const archivedReport: ArchivedReport = {
      id: uuidv4(),
      provider,
      year,
      month,
      fileName,
      fileSize: new Blob([reportJson]).size,
      createdAt: new Date().toISOString(),
      reportData: report,
      metadata: {
        totalErrors: report.totalErrors,
        totalCost: report.charges.totalAmount,
        generatedBy,
        version: this.VERSION,
      },
    };

    this.archives.set(archivedReport.id, archivedReport);
    return archivedReport;
  }

  private generateFileName(
    provider: string,
    year: number,
    month: number
  ): string {
    const monthStr = month.toString().padStart(2, '0');
    return `${provider.toLowerCase()}-error-report-${year}-${monthStr}.json`;
  }

  getReport(id: string): ArchivedReport | undefined {
    return this.archives.get(id);
  }

  getReportsByProvider(
    provider: ThirdPartyIdentifier,
    year?: number,
    month?: number
  ): ArchivedReport[] {
    return Array.from(this.archives.values())
      .filter(report => {
        const matchesProvider = report.provider === provider;
        const matchesYear = year ? report.year === year : true;
        const matchesMonth = month ? report.month === month : true;
        return matchesProvider && matchesYear && matchesMonth;
      })
      .sort((a, b) => {
        // Sort by date, newest first
        const dateA = new Date(a.year, a.month - 1);
        const dateB = new Date(b.year, b.month - 1);
        return dateB.getTime() - dateA.getTime();
      });
  }

  getArchiveStats(): ArchiveStats {
    const reports = Array.from(this.archives.values());
    const reportsByProvider: Record<string, number> = {};

    reports.forEach(report => {
      reportsByProvider[report.provider] = (reportsByProvider[report.provider] || 0) + 1;
    });

    const dates = reports.map(r => new Date(r.year, r.month - 1));
    const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));

    return {
      totalReports: reports.length,
      totalSize: reports.reduce((sum, report) => sum + report.fileSize, 0),
      oldestReport: oldestDate.toISOString(),
      latestReport: latestDate.toISOString(),
      reportsByProvider,
    };
  }

  searchArchive(query: string): ArchivedReport[] {
    const normalizedQuery = query.toLowerCase();
    return Array.from(this.archives.values()).filter(report => {
      const searchableContent = [
        report.provider.toLowerCase(),
        report.fileName.toLowerCase(),
        report.metadata.generatedBy.toLowerCase(),
        `${report.year}`,
        `${report.month}`,
      ].join(' ');

      return searchableContent.includes(normalizedQuery);
    });
  }

  deleteReport(id: string): boolean {
    return this.archives.delete(id);
  }

  clearOldReports(monthsToKeep: number): void {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);

    for (const [id, report] of this.archives.entries()) {
      const reportDate = new Date(report.year, report.month - 1);
      if (reportDate < cutoffDate) {
        this.archives.delete(id);
      }
    }
  }
}