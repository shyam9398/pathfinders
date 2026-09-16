import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate } from 'react-router-dom';

import { UserRole } from '@/types/capacityConnect';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const { isLoading: languageLoading, t } = useLanguage();

  // Show loading while checking auth or language
  if (loading || languageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Enforce role-based access if specified
  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    // Strict Admin enforcement: Guests are never permitted admin access
    if (allowed.includes('admin')) {
      if (user.id === 'guest' || user.role !== 'admin') {
        toast.error(t('auth.adminRoleMissing', 'You do not have administrator access.'));
        return <Navigate to="/auth?role=admin" replace />;
      }
    } else if (allowed.includes('trainer')) {
      // Strict Trainer enforcement: Guests are not permitted trainer access
      if (user.id === 'guest' || user.role !== 'trainer') {
        toast.error(t('auth.trainerAccessDenied', 'Trainer access requires an approved trainer account.'));
        return <Navigate to="/auth?role=trainer" replace />;
      }
    } else if (!allowed.includes(user.role)) {
      toast.error(t('auth.accessDenied', 'Access denied for your role.'));
      return <Navigate to="/main" replace />;
    }
  }

  // If authenticated and authorized, render children
  return <>{children}</>;
};

export default ProtectedRoute;