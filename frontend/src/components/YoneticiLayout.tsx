import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Building2, Home, BedDouble, Calendar, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';

const navigation = [
  { name: 'Genel Bakış', href: '/yonetici', icon: Home },
  { name: 'Otel Bilgileri', href: '/yonetici/otel', icon: Building2 },
  { name: 'Odalar', href: '/yonetici/odalar', icon: BedDouble },
  { name: 'Rezervasyonlar', href: '/yonetici/rezervasyonlar', icon: Calendar },
];

export default function YoneticiLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Başarıyla çıkış yapıldı');
      navigate('/giris');
    } catch (error) {
      toast.error('Çıkış yapılırken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== 'MANAGER') {
    return <Navigate to="/giris" />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-semibold text-gray-900">Yönetici Paneli</h1>
            </div>
            <div className="mt-5 flex-1 flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                  >
                    <item.icon className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                    {item.name}
                  </a>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full group flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-900"
                >
                  <LogOut className="mr-3 h-6 w-6 flex-shrink-0 text-red-400 group-hover:text-red-500" />
                  Çıkış Yap
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}