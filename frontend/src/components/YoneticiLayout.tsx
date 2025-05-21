import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import {
  HomeIcon,
  KeyIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/yonetici', icon: HomeIcon },
  { name: 'Otel Bilgileri', href: '/yonetici/otel', icon: BuildingOfficeIcon },
  { name: 'Odalar', href: '/yonetici/odalar', icon: KeyIcon },
  { name: 'Rezervasyonlar', href: '/yonetici/rezervasyonlar', icon: CalendarIcon },
];

export default function YoneticiLayout() {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (!user) {
      navigate('/giris');
      return;
    }

    if (!isManager) {
      navigate('/');
    }
  }, [user, isManager, navigate]);

  if (!user || !isManager) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-xl font-bold">Yönetici Panel</h2>
          <p className="text-sm text-gray-600">{user.firstName} {user.lastName}</p>
        </div>
        <nav className="mt-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-2 ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <button
            onClick={logout}
            className="group block w-full flex-shrink-0"
          >
            <div className="flex items-center">
              <div>
                <ArrowLeftOnRectangleIcon
                  className="inline-block h-6 w-6 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Çıkış Yap
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}