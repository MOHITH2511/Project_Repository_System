import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router';
import { getMe } from '../api/authApi';
import { clearSession, getCurrentUser, isAuthenticated, setCurrentUser } from '../api/session';
import type { UserRole } from '../api/types';

export function roleDefaultPath(role?: UserRole): string {
  if (role === 'REVIEWER') return '/reviewer';
  if (role === 'ADMIN') return '/admin';
  return '/contributor';
}

export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  if (isAuthenticated()) {
    return <Navigate to={roleDefaultPath(getCurrentUser()?.role)} replace />;
  }

  return <>{children}</>;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function RoleLanding() {
  const user = getCurrentUser();
  return <Navigate to={roleDefaultPath(user?.role)} replace />;
}

export function RequireRole({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) {
  const [userRole, setUserRole] = useState<UserRole | undefined>(getCurrentUser()?.role);
  const [isLoading, setIsLoading] = useState(!userRole);

  useEffect(() => {
    if (userRole) {
      return;
    }

    if (!isAuthenticated()) {
      setIsLoading(false);
      return;
    }

    getMe()
      .then((user) => {
        setCurrentUser(user);
        setUserRole(user.role);
      })
      .catch(() => {
        clearSession();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userRole]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Loading...</div>;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to={roleDefaultPath(userRole)} replace />;
  }

  return <>{children}</>;
}
