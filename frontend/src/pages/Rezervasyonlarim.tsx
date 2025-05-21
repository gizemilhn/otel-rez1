import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import api from '../config/axios';

interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalPrice: number;
  guestCount: number;
  createdAt: string;
  room: {
    id: string;
    number: string;
    type: string;
    price: number;
    hotel: {
      id: string;
      name: string;
      city: string;
    };
  };
}

const Rezervasyonlarim = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const fetchReservations = async () => {
    try {
      const response = await api.get('/user/reservations');
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Rezervasyonlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (id: string) => {
    if (!window.confirm('Bu rezervasyonu iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await api.put(`/user/reservations/${id}/cancel`);
      toast.success('Rezervasyon başarıyla iptal edildi.');
      fetchReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error('Rezervasyon iptal edilirken bir hata oluştu.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Beklemede';
      case 'CONFIRMED':
        return 'Onaylandı';
      case 'CANCELLED':
        return 'İptal Edildi';
      case 'COMPLETED':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">Lütfen giriş yapın.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Rezervasyonlarım</h1>

      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Henüz rezervasyonunuz bulunmuyor.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <li key={reservation.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {reservation.room.hotel.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {reservation.room.hotel.city} - {reservation.room.type} (Oda {reservation.room.number})
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          reservation.status
                        )}`}
                      >
                        {getStatusText(reservation.status)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        <span className="mr-2">Giriş:</span>
                        {format(new Date(reservation.checkIn), 'dd MMMM yyyy', { locale: tr })}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <span className="mr-2">Çıkış:</span>
                        {format(new Date(reservation.checkOut), 'dd MMMM yyyy', { locale: tr })}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <span className="mr-2">Toplam:</span>
                      {reservation.totalPrice.toLocaleString('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      })}
                    </div>
                  </div>
                  {reservation.status === 'PENDING' && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Rezervasyonu İptal Et
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Rezervasyonlarim; 