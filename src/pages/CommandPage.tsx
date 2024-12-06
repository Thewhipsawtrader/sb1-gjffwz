import { useState } from 'react';
import { CommandInput } from '../components/CommandInput';
import { CommandPreview } from '../components/CommandPreview';
import { CommandStatus } from '../components/CommandStatus';
import { ParsedCommand, CommandResult } from '../types/command';
import { MikrotikService } from '../services/mikrotik';

export function CommandPage() {
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
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">WiFi Command Center</h2>
        <CommandInput onCommandSubmit={handleCommandSubmit} />
      </div>

      {currentCommand && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Command Preview</h3>
          <CommandPreview command={currentCommand} />
        </div>
      )}

      {commandResult && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Command Status</h3>
          <CommandStatus result={commandResult} />
        </div>
      )}
    </div>
  );
}