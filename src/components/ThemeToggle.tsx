import { Sun, Moon, Cloud } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'light'
            ? 'bg-white text-yellow-500 shadow-sm'
            : 'text-gray-500 hover:text-yellow-500'
        }`}
        title="Light Mode"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark'
            ? 'bg-gray-700 text-blue-400 shadow-sm'
            : 'text-gray-500 hover:text-blue-400'
        }`}
        title="Dark Mode"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme('grey')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'grey'
            ? 'bg-gray-600 text-gray-300 shadow-sm'
            : 'text-gray-500 hover:text-gray-400'
        }`}
        title="Grey Mode"
      >
        <Cloud className="h-4 w-4" />
      </button>
    </div>
  );
}