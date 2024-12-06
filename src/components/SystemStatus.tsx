import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, WifiOff } from 'lucide-react';
import { IssueMonitor } from '../services/issueMonitor';

interface SystemStatusProps {
  className?: string;
}

export function SystemStatus({ className = '' }: SystemStatusProps) {
  const [status, setStatus] = useState<{
    isConnected: boolean;
    lastChecked: Date;
    responseTime: number;
  } | null>(null);

  useEffect(() => {
    const monitor = IssueMonitor.getInstance();
    
    const updateStatus = () => {
      const currentStatus = monitor.getLastStatus();
      if (currentStatus) {
        setStatus(currentStatus);
      }
    };

    // Update initially and every 30 seconds
    updateStatus();
    const interval = setInterval(updateStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const getStatusIndicator = () => {
    if (!status.isConnected) {
      return {
        icon: <WifiOff className="h-5 w-5 text-red-500" />,
        text: 'Disconnected',
        className: 'bg-red-50 text-red-700 border-red-200',
      };
    }

    if (status.responseTime > 1000) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        text: 'Slow Connection',
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      };
    }

    return {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      text: 'Connected',
      className: 'bg-green-50 text-green-700 border-green-200',
    };
  };

  const indicator = getStatusIndicator();

  return (
    <div className={`rounded-lg border p-4 ${indicator.className} ${className}`}>
      <div className="flex items-center space-x-3">
        {indicator.icon}
        <div className="flex-1">
          <h3 className="text-sm font-medium">{indicator.text}</h3>
          <p className="text-xs opacity-75">
            Response time: {status.responseTime}ms
            <br />
            Last checked: {status.lastChecked.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}