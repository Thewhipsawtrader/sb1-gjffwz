import { useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { CommandInput } from './CommandInput';
import { CommandPreview } from './CommandPreview';
import { CommandStatus } from './CommandStatus';
import { ParsedCommand, CommandResult } from '../types/command';
import { MikrotikService } from '../services/mikrotik';

export function WifiControls() {
  const [currentCommand, setCurrentCommand] = useState<ParsedCommand | null>(null);
  const [commandResult, setCommandResult] = useState<CommandResult | null>(null);

  const handleCommandSubmit = async (command: ParsedCommand) => {
    setCurrentCommand(command);
    setCommandResult({ status: 'processing', message: 'Processing command...', timestamp: new Date().toISOString() });

    try {
      const result = await MikrotikService.executeCommand(command);
      setCommandResult(result);
    } catch (error) {
      setCommandResult({
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 grey:bg-gray-600 shadow rounded-lg divide-y dark:divide-gray-700 grey:divide-gray-500">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex space-x-1">
            <Wifi className="h-5 w-5 text-green-500 dark:text-green-400 grey:text-green-300" />
            <WifiOff className="h-5 w-5 text-red-500 dark:text-red-400 grey:text-red-300" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white grey:text-gray-100">
            WiFi Control Center
          </h2>
        </div>
        <CommandInput onCommandSubmit={handleCommandSubmit} />
      </div>

      {currentCommand && (
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white grey:text-gray-100 mb-4">
            Command Preview
          </h3>
          <CommandPreview command={currentCommand} />
        </div>
      )}

      {commandResult && (
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white grey:text-gray-100 mb-4">
            Command Status
          </h3>
          <CommandStatus result={commandResult} />
        </div>
      )}
    </div>
  );
}