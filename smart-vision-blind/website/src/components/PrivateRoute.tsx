/**
 * src/components/PrivateRoute.tsx
 * Guards React Router routes based on authentication status and user role.
 * Redirects to /login if unauthenticated, or shows 403 if wrong role.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';

interface PrivateRouteProps {
  /** The component to render if auth passes */
  children: React.ReactNode;
  /** If provided, only users with one of these roles can access the route */
  allowedRoles?: UserRole[];
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  // Show nothing while session is being restored
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f2c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login page, preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role → show forbidden screen
  if (allowedRoles && !hasRole(...allowedRoles)) {
    return (
      <div className="min-h-screen bg-[#0a0f2c] flex items-center justify-center text-white px-6">
        <div className="max-w-md text-center space-y-6">
          <div className="text-8xl font-black text-red-500">403</div>
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-slate-400">
            You don't have permission to view this page.
            <br />Required role: <span className="text-amber-400 font-bold">{allowedRoles.join(' or ')}</span>
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
