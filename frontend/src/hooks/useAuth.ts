import { useState, useEffect } from 'react';
import { authService } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Found token, fetching user profile...');
      authService.getMe()
        .then(userData => {
          console.log('User profile fetched:', userData);
          setUser(userData);

          // Handle role-based redirection
          const currentPath = location.pathname;
          if (currentPath === '/giris' || currentPath === '/kayit') {
            if (userData.role === 'ADMIN') {
              navigate('/admin');
            } else if (userData.role === 'MANAGER') {
              navigate('/yonetici');
            } else {
              navigate('/');
            }
          } else if (currentPath.startsWith('/yonetici') && userData.role !== 'MANAGER') {
            navigate('/');
          } else if (currentPath.startsWith('/admin') && userData.role !== 'ADMIN') {
            navigate('/');
          }
        })
        .catch((error) => {
          console.error('Error fetching user profile:', error);
          localStorage.removeItem('token');
          setUser(null);
          navigate('/giris');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log('No token found');
      setUser(null);
      setLoading(false);
      if (location.pathname.startsWith('/yonetici') || location.pathname.startsWith('/admin')) {
        navigate('/giris');
      }
    }
  }, [navigate, location.pathname]);

  const login = async (email: string, password: string) => {
    console.log('Attempting login...');
    try {
      const response = await authService.login(email, password);
      console.log('Login response:', response);
      localStorage.setItem('token', response.token);
      setUser(response.user);

      // Role-based redirection after login
      if (response.user.role === 'ADMIN') {
        navigate('/admin');
      } else if (response.user.role === 'MANAGER') {
        navigate('/yonetici');
      } else {
        navigate('/');
      }

      return response.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/giris');
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isManager: user?.role === 'MANAGER'
  };
} 