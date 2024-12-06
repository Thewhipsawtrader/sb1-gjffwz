import { useState } from 'react';
import { parseCommand } from '../utils/commandParser';
import { ParsedCommand } from '../types/command';
import { Send } from 'lucide-react';

interface CommandInputProps {
  onCommandSubmit: (command: ParsedCommand) => void;
}

export function CommandInput({ onCommandSubmit }: CommandInputProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedCommand = parseCommand(input);
    
    if (!parsedCommand) {
      setError('Invalid command format. Please check your input and try again.');
      return;
    }

    onCommandSubmit(parsedCommand);
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your command (e.g., 'Please deactivate wifi for John Smith, Unit 102A due to rent outstanding.')"
          className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white grey:bg-gray-500 grey:border-gray-400 grey:text-gray-100"
        />
        <button
          type="submit"
          className="absolute bottom-3 right-3 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 grey:bg-indigo-400 grey:hover:bg-indigo-500"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 grey:text-red-300">{error}</p>
      )}
    </form>
  );
}