import { useState, useEffect } from 'react';
import { BillingService } from '../services/billingService';
import { BillingReport as BillingReportType } from '../types/billing';
import { FileText, TrendingUp, AlertCircle } from 'lucide-react';

interface BillingReportProps {
  className?: string;
}

export function BillingReport({ className = '' }: BillingReportProps) {
  const [report, setReport] = useState<BillingReportType | null>(null);

  useEffect(() => {
    const currentDate = new Date();
    const report = BillingService.getInstance().generateMonthlyBillingReport(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1
    );
    setReport(report);
  }, []);

  if (!report) return null;

  const formatCurrency = (amount: number): string => {
    return `R${amount.toFixed(2)}`;
  };

  const getProviderColor = (provider: string): string => {
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

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Billing Report</h2>
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
                <p className="text-sm font-medium text-gray-600">Total Cost</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(report.totalCost)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Cost/Error</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(report.totalCost / report.totalErrors)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {report.bills.map((bill) => (
            <div key={bill.provider} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-medium ${getProviderColor(bill.provider)}`}>
                    {bill.provider}
                  </h3>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(bill.totalCost)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {bill.totalErrors.toLocaleString()} errors
                </p>
              </div>
              <div className="divide-y divide-gray-200">
                {bill.breakdown.map((tier, index) => (
                  <div key={index} className="px-4 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-gray-900">
                          {tier.tier}
                        </span>
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
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Billing period: {new Date(report.period.startDate).toLocaleDateString()} to{' '}
          {new Date(report.period.endDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}