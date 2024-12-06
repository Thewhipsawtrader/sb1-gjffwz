import { useState } from 'react';
import { BillingReport } from '../components/BillingReport';
import { MonthlyReportViewer } from '../components/MonthlyReportViewer';
import { ThirdPartyIdentifier } from '../types/errorCollection';

export function ReportsPage() {
  const [selectedProvider, setSelectedProvider] = useState<ThirdPartyIdentifier>('MIKROTIK');

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Reports</h2>
        <div className="mb-4">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as ThirdPartyIdentifier)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="MIKROTIK">Mikrotik</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="EMAIL">Email</option>
            <option value="CLERK">Clerk</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <MonthlyReportViewer provider={selectedProvider} />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Billing Overview</h2>
        <BillingReport />
      </div>
    </div>
  );
}