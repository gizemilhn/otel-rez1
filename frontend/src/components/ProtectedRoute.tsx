import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/giris" />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  if (requireManager && user.role !== 'MANAGER') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
} 