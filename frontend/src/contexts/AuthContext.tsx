import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

// Types
export type UserRole = 'admin' | 'yonetici' | 'musteri';

interface User {
  id: number;
  ad: string;
  soyad: string;
  email: string;
  telefon: string;
  rol: UserRole;
  otelId?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isYonetici: boolean;
}

interface RegisterData {
  ad: string;
  soyad: string;
  email: string;
  telefon: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser({
            id: userData.id,
            ad: userData.ad,
            soyad: userData.soyad,
            email: userData.email,
            telefon: userData.telefon,
            rol: userData.rol,
            otelId: userData.otelId
          });
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { token } = await authService.login(email, password);
      localStorage.setItem('token', token);
      
      const userData = await authService.getMe();
      const authenticatedUser = {
        id: userData.id,
        ad: userData.ad,
        soyad: userData.soyad,
        email: userData.email,
        telefon: userData.telefon,
        rol: userData.rol,
        otelId: userData.otelId
      };
      
      setUser(authenticatedUser);

      switch (authenticatedUser.rol) {
        case 'admin':
          navigate('/admin');
          break;
        case 'yonetici':
          navigate('/yonetici');
          break;
        default:
          navigate('/profil');
      }
    } catch (error) {
      throw new Error('Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      console.log('sdfhdhdfhd')
      await authService.register(userData);
      navigate('/giris');
    } catch (error) {
      throw new Error('Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    navigate('/');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.rol === 'admin',
    isYonetici: user?.rol === 'yonetici'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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