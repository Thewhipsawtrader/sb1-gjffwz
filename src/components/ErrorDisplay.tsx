import { useEffect, useState } from 'react';
import { AlertTriangle, XCircle, Clock } from 'lucide-react';
import { TechnicalError } from '../types/errors';
import { ErrorReporter } from '../services/errorReporter';

interface ErrorDisplayProps {
  className?: string;
  maxErrors?: number;
}

export function ErrorDisplay({ 
  className = '', 
  maxErrors = 5 
}: ErrorDisplayProps) {
  const [errors, setErrors] = useState<TechnicalError[]>([]);

  useEffect(() => {
    const updateErrors = () => {
      const recentErrors = ErrorReporter.getInstance()
        .getRecentErrors()
        .slice(0, maxErrors);
      setErrors(recentErrors);
    };

    updateErrors();
    const interval = setInterval(updateErrors, 30000);

    return () => clearInterval(interval);
  }, [maxErrors]);

  if (errors.length === 0) return null;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'HIGH':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-50 border-red-200';
      case 'HIGH':
        return 'bg-orange-50 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {errors.map((error) => (
        <div
          key={error.id}
          className={`rounded-lg border p-4 ${getSeverityClass(error.severity)}`}
        >
          <div className="flex items-start space-x-3">
            {getSeverityIcon(error.severity)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {error.category.replace(/_/g, ' ')}
                </p>
                <span className="text-xs text-gray-500">
                  {new Date(error.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600">{error.message}</p>
              {error.code && (
                <p className="mt-1 text-xs text-gray-500">
                  Error Code: {error.code}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}