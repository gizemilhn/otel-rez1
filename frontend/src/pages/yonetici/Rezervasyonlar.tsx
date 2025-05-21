import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reservationService } from '../../services/api';

interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalPrice: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  room: {
    id: string;
    number: string;
    type: string;
  };
}

export default function Rezervasyonlar() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const data = await reservationService.getMyHotelReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Rezervasyonlar yüklenirken bir hata oluştu.');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      await reservationService.updateStatus(reservationId, newStatus);
      toast.success('Rezervasyon durumu başarıyla güncellendi.');
      fetchReservations();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast.error('Rezervasyon durumu güncellenirken bir hata oluştu.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
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

  const filteredReservations = selectedStatus === 'ALL'
    ? reservations
    : reservations.filter(res => res.status === selectedStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Rezervasyonlar</h2>
        <div className="flex items-center space-x-4">
          <label htmlFor="status" className="text-sm font-medium text-gray-700">
            Durum Filtresi:
          </label>
          <select
            id="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="ALL">Tümü</option>
            <option value="PENDING">Beklemede</option>
            <option value="CONFIRMED">Onaylandı</option>
            <option value="CANCELLED">İptal Edildi</option>
            <option value="COMPLETED">Tamamlandı</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredReservations.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
              Rezervasyon bulunamadı
            </li>
          ) : (
            filteredReservations.map((reservation) => (
              <li key={reservation.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-blue-600 truncate">
                        {reservation.user.firstName} {reservation.user.lastName}
                      </p>
                      <p className="ml-2 flex-shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Oda {reservation.room.number} - {reservation.room.type}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <select
                        value={reservation.status}
                        onChange={(e) => handleStatusChange(reservation.id, e.target.value)}
                        className={`ml-2 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${getStatusColor(reservation.status)}`}
                      >
                        <option value="PENDING">Beklemede</option>
                        <option value="CONFIRMED">Onaylandı</option>
                        <option value="CANCELLED">İptal Edildi</option>
                        <option value="COMPLETED">Tamamlandı</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Giriş: {formatDate(reservation.checkIn)}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        Çıkış: {formatDate(reservation.checkOut)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p className="font-medium">Toplam: {reservation.totalPrice} TL</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-500">
                      <p>E-posta: {reservation.user.email}</p>
                      <p>Telefon: {reservation.user.phone}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
