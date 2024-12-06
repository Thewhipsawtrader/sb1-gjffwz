import { ParsedCommand } from '../types/command';
import { Wifi, WifiOff } from 'lucide-react';

interface CommandPreviewProps {
  command: ParsedCommand;
}

export function CommandPreview({ command }: CommandPreviewProps) {
  const getCommandIcon = () => {
    switch (command.type) {
      case 'ACTIVATE_WIFI':
        return <Wifi className="h-6 w-6 text-green-500" />;
      case 'DEACTIVATE_WIFI':
        return <WifiOff className="h-6 w-6 text-red-500" />;
    }
  };

  const getCommandText = () => {
    switch (command.type) {
      case 'ACTIVATE_WIFI':
        return 'Activate WiFi';
      case 'DEACTIVATE_WIFI':
        return 'Deactivate WiFi';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <div className="flex items-center space-x-3 mb-4">
        {getCommandIcon()}
        <h3 className="text-lg font-medium">{getCommandText()}</h3>
      </div>
      
      <dl className="grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Unit Number</dt>
          <dd className="mt-1 text-sm text-gray-900">{command.unitNumber}</dd>
        </div>
        
        {command.firstName && command.lastName && (
          <div>
            <dt className="text-sm font-medium text-gray-500">Resident</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {command.firstName} {command.lastName}
            </dd>
          </div>
        )}
        
        {command.reason && (
          <div className="col-span-2">
            <dt className="text-sm font-medium text-gray-500">Reason</dt>
            <dd className="mt-1 text-sm text-gray-900">{command.reason}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}