import React, { useEffect, useState } from 'react';
import { reservationService } from '../../services/api';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  room: {
    number: string;
    type: string;
    hotel: {
      name: string;
    };
  };
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getAll();
      setReservations(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('Failed to fetch reservations');
      toast.error('Rezervasyonlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Rezervasyon iptal edilsin mi?')) return;
    try {
      await reservationService.cancel(id);
      setReservations(reservations.map(r => 
        r.id === id ? { ...r, status: 'CANCELLED' } : r
      ));
      toast.success('Rezervasyon iptal edildi');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error('Rezervasyon iptal edilemedi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Rezervasyon silinsin mi?')) return;
    try {
      await reservationService.delete(id);
      setReservations(reservations.filter(r => r.id !== id));
      toast.success('Rezervasyon silindi');
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Rezervasyon silinemedi');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rezervasyonlar</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Müşteri
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Oda
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Otel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giriş
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Çıkış
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Toplam
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {reservation.user.firstName} {reservation.user.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{reservation.user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{reservation.room.number}</div>
                  <div className="text-sm text-gray-500">{reservation.room.type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{reservation.room.hotel.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(reservation.checkIn).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(reservation.checkOut).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      reservation.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : reservation.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {reservation.status === 'CONFIRMED'
                      ? 'Onaylandı'
                      : reservation.status === 'CANCELLED'
                      ? 'İptal Edildi'
                      : 'Beklemede'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{reservation.totalPrice} TL</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {reservation.status !== 'CANCELLED' && (
                    <>
                      <button
                        onClick={() => handleCancel(reservation.id)}
                        className="text-yellow-600 hover:text-yellow-900 mr-4"
                      >
                        İptal Et
                      </button>
                      <button
                        onClick={() => handleDelete(reservation.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
