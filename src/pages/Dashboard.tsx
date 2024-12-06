import { useUser } from '@clerk/clerk-react';
import { StatusBar } from '../components/StatusBar';
import { WifiControls } from '../components/WifiControls';
import { QuickActions } from '../components/QuickActions';
import { UsageStats } from '../components/UsageStats';

export function Dashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white grey:text-gray-100">
          Welcome, {user?.firstName}!
        </h1>
      </div>

      <StatusBar />

      <div className="grid grid-cols-1 gap-6">
        <WifiControls />
        <QuickActions />
        <UsageStats />
      </div>
    </div>
  );
}