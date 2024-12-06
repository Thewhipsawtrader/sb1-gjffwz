import { BarChart, Clock, Database } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UsageData {
  dataUsage: number;
  activeSessions: number;
  peakUsage: number;
  lastUpdated: string;
}

export function UsageStats() {
  const [usageData, setUsageData] = useState<UsageData>({
    dataUsage: 0,
    activeSessions: 0,
    peakUsage: 0,
    lastUpdated: new Date().toISOString(),
  });

  useEffect(() => {
    // Simulated real-time updates
    const interval = setInterval(() => {
      setUsageData({
        dataUsage: Math.random() * 2.5,
        activeSessions: Math.floor(Math.random() * 400) + 100,
        peakUsage: Math.random() * 3.5,
        lastUpdated: new Date().toISOString(),
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 grey:bg-gray-600 rounded-lg shadow-sm">
      <div className="p-4 border-b dark:border-gray-700 grey:border-gray-500">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white grey:text-gray-100">
          Usage Statistics
        </h3>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-4">
          <Database className="h-8 w-8 text-indigo-500 dark:text-indigo-400 grey:text-indigo-300" />
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 grey:text-gray-200">
              Data Usage (24h)
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white grey:text-gray-100">
              {usageData.dataUsage.toFixed(2)} TB
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <BarChart className="h-8 w-8 text-green-500 dark:text-green-400 grey:text-green-300" />
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 grey:text-gray-200">
              Peak Usage
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white grey:text-gray-100">
              {usageData.peakUsage.toFixed(2)} TB
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Clock className="h-8 w-8 text-blue-500 dark:text-blue-400 grey:text-blue-300" />
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 grey:text-gray-200">
              Active Sessions
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white grey:text-gray-100">
              {usageData.activeSessions}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 grey:bg-gray-500 text-xs text-gray-500 dark:text-gray-300 grey:text-gray-200 rounded-b-lg">
        Last updated: {new Date(usageData.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}