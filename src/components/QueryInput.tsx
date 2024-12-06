import { useState } from 'react';
import { parseQuery } from '../utils/queryParser';
import { QueryService } from '../services/queryService';
import { Search } from 'lucide-react';

interface QueryInputProps {
  onQueryResult: (result: string) => void;
}

export function QueryInput({ onQueryResult }: QueryInputProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const parsedQuery = parseQuery(input);
      
      if (!parsedQuery) {
        setError('Invalid query format. Please check your input and try again.');
        return;
      }

      const result = await QueryService.processQuery(parsedQuery);
      
      if (!result) {
        setError('No information found for this query.');
        return;
      }

      const formattedResponse = QueryService.formatQueryResponse(result);
      onQueryResult(formattedResponse);
      setInput('');
    } catch (error) {
      setError('An error occurred while processing your query.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a student's WiFi status (e.g., 'Is Unit 102A active?')"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </form>
  );
}