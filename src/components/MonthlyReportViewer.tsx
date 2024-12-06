import { useState, useEffect } from 'react';
import { MonthlyReportService } from '../services/monthlyReportService';
import { MonthlyErrorSummary } from '../types/monthlyReport';
import { ThirdPartyIdentifier } from '../types/errorCollection';
import { BarChart3, TrendingUp, AlertCircle, Mail } from 'lucide-react';

interface MonthlyReportViewerProps {
  provider: ThirdPartyIdentifier;
  className?: string;
}

export function MonthlyReportViewer({ provider, className = '' }: MonthlyReportViewerProps) {
  const [report, setReport] = useState<MonthlyErrorSummary | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      const currentDate = new Date();
      const report = await MonthlyReportService.getInstance().getReportForProvider(
        provider,
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      );
      setReport(report);
    };

    loadReport();
  }, [provider]);

  if (!report) return null;

  const formatCurrency = (amount: number): string => {
    return `R${amount.toFixed(2)}`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (percentageChange: number) => {
    if (percentageChange > 0) {
      return <TrendingUp className="h-5 w-5 text-red-500" />;
    }
    return <TrendingUp className="h-5 w-5 text-green-500" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Monthly Error Report - {provider}
          </h2>
          <span className="text-sm text-gray-500">
            {new Date(report.period.startDate).toLocaleDateString()} - {' '}
            {new Date(report.period.endDate).toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Errors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {report.totalErrors.toLocaleString()}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Charges</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(report.charges.totalAmount)}
                </p>
              </div>
              <Mail className="h-8 w-8 text-indigo-500" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Month-over-Month</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatPercentage(report.trends.percentageChange)}
                  </p>
                  {getTrendIcon(report.trends.percentageChange)}
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="text-sm font-medium text-gray-900">Error Breakdown</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {report.errorBreakdown.map((category) => (
                <div key={category.category} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {category.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {category.count.toLocaleString()} ({formatPercentage(category.percentage)})
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 rounded-full h-2"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="text-sm font-medium text-gray-900">Top Recurring Errors</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {report.topErrors.map((error, index) => (
                <div key={index} className="px-4 py-3">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{error.message}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Occurred {error.count} times
                        <span className="mx-2">•</span>
                        Last seen: {new Date(error.lastOccurrence).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="text-sm font-medium text-gray-900">Billing Breakdown</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {report.charges.breakdown.map((tier, index) => (
                <div key={index} className="px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-gray-900">{tier.tier}</span>
                      <span className="text-gray-600">
                        {' '}
                        • {tier.errors.toLocaleString()} errors at {formatCurrency(tier.rate)} each
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(tier.cost)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}