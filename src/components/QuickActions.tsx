import { useState } from 'react';
import { Wifi, WifiOff, Search, ArrowRight } from 'lucide-react';
import { MikrotikService } from '../services/mikrotik';
import { parseCommand } from '../utils/commandParser';
import { CommandResult } from '../types/command';

export function QuickActions() {
  const [unitNumber, setUnitNumber] = useState('');
  const [status, setStatus] = useState<CommandResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleActivate = async () => {
    if (!unitNumber) return;
    setIsLoading(true);
    try {
      const command = parseCommand(`activate wifi for unit ${unitNumber}`);
      if (command) {
        const result = await MikrotikService.executeCommand(command);
        setStatus(result);
      }
    } catch (error) {
      setStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!unitNumber) return;
    setIsLoading(true);
    try {
      const command = parseCommand(`deactivate wifi for unit ${unitNumber}`);
      if (command) {
        const result = await MikrotikService.executeCommand(command);
        setStatus(result);
      }
    } catch (error) {
      setStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!unitNumber) return;
    setIsLoading(true);
    try {
      const status = await MikrotikService.getStatus(unitNumber);
      setStatus({
        status: 'success',
        message: `WiFi is currently ${status ? 'active' : 'inactive'} for Unit ${unitNumber}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 grey:bg-gray-600 shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white grey:text-gray-100 mb-4">
        Quick Actions
      </h2>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={unitNumber}
            onChange={(e) => setUnitNumber(e.target.value)}
            placeholder="Enter Unit Number"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white grey:bg-gray-500 grey:border-gray-400 grey:text-gray-100"
          />
          <button
            onClick={checkStatus}
            disabled={!unitNumber || isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600 grey:bg-indigo-400 grey:hover:bg-indigo-500"
          >
            <Search className="h-4 w-4 mr-2" />
            Check Status
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleActivate}
            disabled={!unitNumber || isLoading}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-500 dark:hover:bg-green-600 grey:bg-green-400 grey:hover:bg-green-500"
          >
            <Wifi className="h-4 w-4 mr-2" />
            Activate WiFi
          </button>
          <button
            onClick={handleDeactivate}
            disabled={!unitNumber || isLoading}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-500 dark:hover:bg-red-600 grey:bg-red-400 grey:hover:bg-red-500"
          >
            <WifiOff className="h-4 w-4 mr-2" />
            Deactivate WiFi
          </button>
        </div>

        {status && (
          <div className={`mt-4 p-4 rounded-md ${
            status.status === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 grey:bg-green-800/20 text-green-700 dark:text-green-200 grey:text-green-100' 
              : 'bg-red-50 dark:bg-red-900/20 grey:bg-red-800/20 text-red-700 dark:text-red-200 grey:text-red-100'
          }`}>
            <p>{status.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}