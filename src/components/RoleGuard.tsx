import { useUser } from '@clerk/clerk-react';
import { ReactNode } from 'react';
import { UserRole } from '../types/auth';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role as UserRole;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this content.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}