import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import type { User } from '../types';

const Profil = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">Lütfen giriş yapın.</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profil Bilgilerim</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Kişisel Bilgiler</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ad</label>
                <div className="mt-1 text-gray-900">{user.firstName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Soyad</label>
                <div className="mt-1 text-gray-900">{user.lastName}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-posta</label>
                <div className="mt-1 text-gray-900">{user.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefon</label>
                <div className="mt-1 text-gray-900">{user.phone || '-'}</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Kimlik Bilgileri</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">TC Kimlik No</label>
                <div className="mt-1 text-gray-900">{user.tcNumber || '-'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Doğum Tarihi</label>
                <div className="mt-1 text-gray-900">
                  {user.birthDate ? format(new Date(user.birthDate), 'dd MMMM yyyy', { locale: tr }) : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Hesap Bilgileri</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Üyelik Tarihi</label>
              <div className="mt-1 text-gray-900">
                {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: tr })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Son Güncelleme</label>
              <div className="mt-1 text-gray-900">
                {format(new Date(user.updatedAt), 'dd MMMM yyyy', { locale: tr })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            to="/rezervasyonlarim"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Calendar className="h-5 w-5 mr-2" />
            Rezervasyonlarımı Görüntüle
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profil; 