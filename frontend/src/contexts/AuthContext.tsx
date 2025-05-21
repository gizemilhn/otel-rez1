import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType, RegisterData } from '../types';
import api from '../config/axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  // Role-based checks
  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isUser = user?.role === 'USER';

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      const userData = response.data;
      setUser(userData);
      setError(null);

      // Redirect based on role if on login/register page
      const currentPath = window.location.pathname;
      if (currentPath === '/giris' || currentPath === '/kayit') {
        if (userData.role === 'ADMIN') {
          navigate('/admin');
        } else if (userData.role === 'MANAGER') {
          navigate('/yonetici');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile');
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);

      // Role-based redirection
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'MANAGER') {
        navigate('/yonetici');
      } else {
        navigate('/');
      }

      return user;
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
    navigate('/giris');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAdmin,
        isManager,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
