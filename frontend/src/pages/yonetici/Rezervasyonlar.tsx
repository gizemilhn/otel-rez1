import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { reservationService } from '../../services/api';

interface Reservation {
  id: string;
  checkIn: string;
  checkOut: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  totalPrice: number;
  specialRequests?: string;
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
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getManagerReservations();
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Rezervasyonlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reservationId: string, newStatus: Reservation['status']) => {
    try {
      await reservationService.updateStatus(reservationId, newStatus);
      toast.success('Rezervasyon durumu güncellendi');
      fetchReservations();
    } catch (error) {
      toast.error('Rezervasyon durumu güncellenirken bir hata oluştu');
    }
  };

  const handleEditSpecialRequests = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setSpecialRequests(reservation.specialRequests || '');
  };

  const handleSaveSpecialRequests = async () => {
    if (!editingReservation) return;

    try {
      await reservationService.updateReservation(editingReservation.id, {
        specialRequests
      });
      toast.success('Özel istekler güncellendi');
      setEditingReservation(null);
      fetchReservations();
    } catch (error) {
      toast.error('Özel istekler güncellenirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Rezervasyonlar</h1>
          <p className="mt-2 text-sm text-gray-700">
            Otelinize ait tüm rezervasyonları buradan yönetebilirsiniz.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Müşteri</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Oda</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tarihler</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Durum</th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Özel İstekler</th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {reservations && reservations.length > 0 ? (
                    reservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="font-medium text-gray-900">
                            {reservation.user.firstName} {reservation.user.lastName}
                          </div>
                          <div>{reservation.user.email}</div>
                          <div>{reservation.user.phone}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="font-medium text-gray-900">{reservation.room.number}</div>
                          <div>{reservation.room.type}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div>Giriş: {new Date(reservation.checkIn).toLocaleDateString()}</div>
                          <div>Çıkış: {new Date(reservation.checkOut).toLocaleDateString()}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <select
                            value={reservation.status}
                            onChange={(e) => handleStatusChange(reservation.id, e.target.value as Reservation['status'])}
                            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                          >
                            <option value="PENDING">Beklemede</option>
                            <option value="CONFIRMED">Onaylandı</option>
                            <option value="CANCELLED">İptal Edildi</option>
                            <option value="COMPLETED">Tamamlandı</option>
                          </select>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {editingReservation?.id === reservation.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={specialRequests}
                                onChange={(e) => setSpecialRequests(e.target.value)}
                                rows={3}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                placeholder="Özel istekleri buraya yazın..."
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={handleSaveSpecialRequests}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  Kaydet
                                </button>
                                <button
                                  onClick={() => setEditingReservation(null)}
                                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  İptal
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-gray-900">{reservation.specialRequests || 'Özel istek yok'}</p>
                              <button
                                onClick={() => handleEditSpecialRequests(reservation)}
                                className="mt-1 text-sm text-blue-600 hover:text-blue-500"
                              >
                                Düzenle
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            onClick={() => handleEditSpecialRequests(reservation)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Düzenle
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-sm text-gray-500 text-center">
                        Henüz rezervasyon bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
