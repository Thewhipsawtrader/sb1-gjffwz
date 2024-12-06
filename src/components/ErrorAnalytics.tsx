import { useState, useEffect } from 'react';
import { BarChart3, PieChart } from 'lucide-react';
import { ErrorCollectionService } from '../services/errorCollectionService';
import { ErrorReport, ThirdPartyIdentifier } from '../types/errorCollection';

interface ErrorAnalyticsProps {
  className?: string;
}

export function ErrorAnalytics({ className = '' }: ErrorAnalyticsProps) {
  const [report, setReport] = useState<ErrorReport | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ThirdPartyIdentifier>('MIKROTIK');

  useEffect(() => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    const monthlyReport = ErrorCollectionService.getInstance().getMonthlyReport(year, month);
    setReport(monthlyReport);
  }, []);

  if (!report) return null;

  const getProviderColor = (provider: ThirdPartyIdentifier): string => {
    switch (provider) {
      case 'MIKROTIK':
        return 'text-blue-600';
      case 'WHATSAPP':
        return 'text-green-600';
      case 'EMAIL':
        return 'text-purple-600';
      case 'CLERK':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const selectedStats = report.providers[selectedProvider];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(report.providers).map(([provider, stats]) => (
          <button
            key={provider}
            onClick={() => setSelectedProvider(provider as ThirdPartyIdentifier)}
            className={`p-4 rounded-lg border ${
              selectedProvider === provider
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-sm font-medium text-gray-600">{provider}</div>
            <div className={`text-2xl font-semibold ${getProviderColor(provider as ThirdPartyIdentifier)}`}>
              {stats.total}
            </div>
            <div className="text-xs text-gray-500">
              {stats.resolution.pending} pending
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Errors by Category</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-2">
            {Object.entries(selectedStats.byCategory).map(([category, count]) => (
              <div key={category} className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">
                      {category}
                    </span>
                    <span className="text-sm text-gray-500">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 rounded-full h-2"
                      style={{
                        width: `${(count / selectedStats.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Errors by Severity</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {Object.entries(selectedStats.bySeverity).map(([severity, count]) => (
              <div key={severity} className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    severity === 'CRITICAL'
                      ? 'bg-red-500'
                      : severity === 'HIGH'
                      ? 'bg-orange-500'
                      : severity === 'MEDIUM'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      {severity}
                    </span>
                    <span className="text-sm text-gray-500">
                      {((count / selectedStats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Errors</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {report.errors
            .filter(error => error.provider === selectedProvider)
            .slice(0, 5)
            .map(error => (
              <div key={error.id} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {error.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(error.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{error.message}</p>
                {error.resolved && (
                  <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Resolved
                  </span>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}