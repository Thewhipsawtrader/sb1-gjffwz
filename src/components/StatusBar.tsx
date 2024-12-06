import { Wifi, Users, Activity, Signal } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NetworkStatus {
  activeUsers: number;
  connectedDevices: number;
  networkHealth: 'Good' | 'Fair' | 'Poor';
  wifiStatus: 'Online' | 'Offline' | 'Degraded';
}

export function StatusBar() {
  const [status, setStatus] = useState<NetworkStatus>({
    activeUsers: 0,
    connectedDevices: 0,
    networkHealth: 'Good',
    wifiStatus: 'Online',
  });

  useEffect(() => {
    // Simulated real-time updates
    const interval = setInterval(() => {
      setStatus({
        activeUsers: Math.floor(Math.random() * 300) + 100,
        connectedDevices: Math.floor(Math.random() * 500) + 200,
        networkHealth: Math.random() > 0.8 ? 'Fair' : 'Good',
        wifiStatus: Math.random() > 0.9 ? 'Degraded' : 'Online',
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Good':
        return 'text-green-500';
      case 'Fair':
        return 'text-yellow-500';
      default:
        return 'text-red-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
        return 'text-green-500';
      case 'Degraded':
        return 'text-yellow-500';
      default:
        return 'text-red-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 grey:bg-gray-600 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 grey:text-gray-200">
              Active Users
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white grey:text-gray-100">
              {status.activeUsers}
            </p>
          </div>
          <Users className="h-8 w-8 text-indigo-500 dark:text-indigo-400 grey:text-indigo-300" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 grey:bg-gray-600 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 grey:text-gray-200">
              Connected Devices
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white grey:text-gray-100">
              {status.connectedDevices}
            </p>
          </div>
          <Signal className="h-8 w-8 text-blue-500 dark:text-blue-400 grey:text-blue-300" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 grey:bg-gray-600 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 grey:text-gray-200">
              Network Health
            </p>
            <p className={`text-2xl font-semibold ${getHealthColor(status.networkHealth)}`}>
              {status.networkHealth}
            </p>
          </div>
          <Activity className="h-8 w-8 text-purple-500 dark:text-purple-400 grey:text-purple-300" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 grey:bg-gray-600 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 grey:text-gray-200">
              WiFi Status
            </p>
            <p className={`text-2xl font-semibold ${getStatusColor(status.wifiStatus)}`}>
              {status.wifiStatus}
            </p>
          </div>
          <Wifi className="h-8 w-8 text-green-500 dark:text-green-400 grey:text-green-300" />
        </div>
      </div>
    </div>
  );
}