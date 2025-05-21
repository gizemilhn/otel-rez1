import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireManager?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin,
  requireManager,
}: ProtectedRouteProps) {
  const { user, isAdmin, isManager } = useAuth();

  if (!user) {
    return <Navigate to="/giris" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireManager && !isManager) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
} 