import React, { createContext, useContext } from 'react';
import { useAuth as useAuthHook } from '../hooks/useAuth';

const AuthContext = createContext<ReturnType<typeof useAuthHook> | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthHook();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 