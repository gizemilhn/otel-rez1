import React, { useEffect, useState } from 'react';
import { rezervasyonService } from '../../services/api';
import { toast } from 'react-toastify';

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

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await rezervasyonService.getAll();
      setReservations(data);
    } catch {
      toast.error('Rezervasyonlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Rezervasyon iptal edilsin mi?')) return;
    try {
      await rezervasyonService.iptalEt(Number(id));
      setReservations(reservations.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r));
      toast.success('Rezervasyon iptal edildi');
    } catch {
      toast.error('Rezervasyon iptal edilemedi');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Rezervasyonlar</h1>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-300 bg-white shadow rounded">
          <thead>
            <tr>
              <th className="px-4 py-2">Müşteri</th>
              <th className="px-4 py-2">Oda</th>
              <th className="px-4 py-2">Otel</th>
              <th className="px-4 py-2">Giriş</th>
              <th className="px-4 py-2">Çıkış</th>
              <th className="px-4 py-2">Durum</th>
              <th className="px-4 py-2">Toplam</th>
              <th className="px-4 py-2">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(r => (
              <tr key={r.id}>
                <td className="px-4 py-2">{r.user.firstName} {r.user.lastName}<br />{r.user.email}</td>
                <td className="px-4 py-2">{r.room.number} - {r.room.type}</td>
                <td className="px-4 py-2">{r.room.hotel.name}</td>
                <td className="px-4 py-2">{new Date(r.checkIn).toLocaleDateString()}</td>
                <td className="px-4 py-2">{new Date(r.checkOut).toLocaleDateString()}</td>
                <td className="px-4 py-2">{r.status}</td>
                <td className="px-4 py-2">{r.totalPrice}</td>
                <td className="px-4 py-2">
                  {r.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      className="text-red-600 hover:underline"
                    >
                      İptal Et
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
