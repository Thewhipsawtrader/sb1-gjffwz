import { useState } from 'react';
import { Search, Calendar, HardDrive, Archive } from 'lucide-react';
import { ArchiveService } from '../services/archiveService';
import { ArchivedReport } from '../types/archive';
import { ThirdPartyIdentifier } from '../types/errorCollection';

interface ArchiveViewerProps {
  className?: string;
}

export function ArchiveViewer({ className = '' }: ArchiveViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<ThirdPartyIdentifier | 'ALL'>('ALL');
  const [selectedYear, setSelectedYear] = useState<number | 'ALL'>('ALL');
  const [selectedReport, setSelectedReport] = useState<ArchivedReport | null>(null);

  const archiveService = ArchiveService.getInstance();
  const stats = archiveService.getArchiveStats();

  const getFilteredReports = (): ArchivedReport[] => {
    let reports: ArchivedReport[] = [];

    if (searchQuery) {
      reports = archiveService.searchArchive(searchQuery);
    } else if (selectedProvider !== 'ALL') {
      reports = archiveService.getReportsByProvider(
        selectedProvider,
        selectedYear === 'ALL' ? undefined : selectedYear
      );
    } else {
      reports = Array.from(Object.values(stats.reportsByProvider).flatMap(provider =>
        archiveService.getReportsByProvider(provider as ThirdPartyIdentifier)
      ));
    }

    return reports;
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatCurrency = (amount: number): string => {
    return `R${amount.toFixed(2)}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Error Report Archive</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalReports}
                </p>
              </div>
              <Archive className="h-8 w-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatFileSize(stats.totalSize)}
                </p>
              </div>
              <HardDrive className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Date Range</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(stats.oldestReport).toLocaleDateString()} -
                  <br />
                  {new Date(stats.latestReport).toLocaleDateString()}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search archives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as ThirdPartyIdentifier | 'ALL')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ALL">All Providers</option>
              <option value="MIKROTIK">Mikrotik</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="EMAIL">Email</option>
              <option value="CLERK">Clerk</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="sm:w-48">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ALL">All Years</option>
              {Array.from(
                new Set(
                  getFilteredReports().map(report => report.year)
                )
              ).sort((a, b) => b - a).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {getFilteredReports().map((report) => (
              <div
                key={report.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {report.fileName}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(report.fileSize)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    <span className="mr-2">{report.provider}</span>
                    <span>
                      {new Date(report.year, report.month - 1).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                  <div>
                    {report.metadata.totalErrors.toLocaleString()} errors
                    <span className="mx-2">•</span>
                    {formatCurrency(report.metadata.totalCost)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedReport.fileName}
                </h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(selectedReport.reportData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}