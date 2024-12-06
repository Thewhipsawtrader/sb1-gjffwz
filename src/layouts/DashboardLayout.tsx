import { ReactNode, useState } from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, LayoutDashboard, Settings, MessageCircle } from 'lucide-react';
import { UserRole } from '../types/auth';
import { ThemeToggle } from '../components/ThemeToggle';
import { ContactModal } from '../components/ContactModal';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const location = useLocation();
  const userRole = user?.publicMetadata?.role as UserRole;
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 grey:bg-gray-700">
      <nav className="bg-white dark:bg-gray-800 grey:bg-gray-600 shadow-sm border-b dark:border-gray-700 grey:border-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 grey:text-indigo-300" />
                <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white grey:text-gray-100">DA Portal</span>
              </div>
              
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/'
                      ? 'text-indigo-600 dark:text-indigo-400 grey:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 grey:bg-indigo-800/50'
                      : 'text-gray-600 dark:text-gray-300 grey:text-gray-200 hover:text-gray-900 dark:hover:text-white grey:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                </Link>

                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      location.pathname === '/admin'
                        ? 'text-indigo-600 dark:text-indigo-400 grey:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 grey:bg-indigo-800/50'
                        : 'text-gray-600 dark:text-gray-300 grey:text-gray-200 hover:text-gray-900 dark:hover:text-white grey:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 grey:text-gray-200 hover:text-gray-900 dark:hover:text-white grey:hover:text-white"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Contact Us</span>
              </button>
              <ThemeToggle />
              <div className="text-sm text-gray-600 dark:text-gray-300 grey:text-gray-200">
                {user?.firstName} {user?.lastName}
              </div>
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-white dark:bg-gray-800 grey:bg-gray-600 border-t dark:border-gray-700 grey:border-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="text-sm text-gray-500 dark:text-gray-400 grey:text-gray-300">
              © 2025 SureConnect
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 grey:text-gray-300">
              Powered by Surelink
            </div>
          </div>
        </div>
      </footer>

      <ContactModal 
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}