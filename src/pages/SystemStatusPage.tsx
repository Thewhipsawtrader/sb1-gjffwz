import { SystemStatus } from '../components/SystemStatus';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { ErrorAnalytics } from '../components/ErrorAnalytics';

export function SystemStatusPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
        <SystemStatus />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Error Analytics</h2>
        <ErrorAnalytics />
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Errors</h2>
        <ErrorDisplay maxErrors={5} />
      </div>
    </div>
  );
}