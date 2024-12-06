import { useUser } from '@clerk/clerk-react';

export function AdminDashboard() {
  const { user } = useUser();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">
        Admin Dashboard
      </h1>
      <p className="text-gray-600">
        Welcome to the admin dashboard. Here you can manage users, view system logs, and configure settings.
      </p>
    </div>
  );
}