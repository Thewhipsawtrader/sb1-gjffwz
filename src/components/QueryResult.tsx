import { WifiOff, Wifi, Clock } from 'lucide-react';

interface QueryResultProps {
  result: string;
}

export function QueryResult({ result }: QueryResultProps) {
  const getStatusIcon = () => {
    if (result.includes('Active')) {
      return <Wifi className="h-6 w-6 text-green-500" />;
    }
    if (result.includes('Deactivated')) {
      return <WifiOff className="h-6 w-6 text-red-500" />;
    }
    return <Clock className="h-6 w-6 text-gray-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
            {result}
          </pre>
        </div>
      </div>
    </div>
  );
}