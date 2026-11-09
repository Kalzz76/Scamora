import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { adminAuth } from '../../admin/services/adminAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  featureName?: string;
  requiredRole?: 'admin' | 'user';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  featureName,
  requiredRole,
}) => {
  const location = useLocation();
  const isAuthenticated = adminAuth.isAuthenticated();
  const user = adminAuth.getUser();
  const toastFiredRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !toastFiredRef.current) {
      toastFiredRef.current = true;
      const label = featureName ? `Fitur ${featureName}` : 'Fitur ini';
      toast.error(`${label} memerlukan akun Scamora. Silakan masuk atau daftar akun baru terlebih dahulu.`, {
        id: 'auth-required-notice',
        duration: 4500,
      });
    }
  }, [isAuthenticated, featureName]);

  if (!isAuthenticated) {
    const targetUrl = `/login?redirect=${encodeURIComponent(location.pathname)}`;
    return <Navigate to={targetUrl} replace />;
  }

  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

