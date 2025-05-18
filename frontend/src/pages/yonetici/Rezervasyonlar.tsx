import React, { useEffect, useState } from 'react';
import { rezervasyonService } from '../../services/api';
import { toast } from 'react-toastify';

export default function YoneticiRezervasyonlar() {
  const [rezervasyonlar, setRezervasyonlar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRezervasyonlar();
  }, []);

  const fetchRezervasyonlar = async () => {
    setLoading(true);
    try {
      const data = await rezervasyonService.getAll();
      setRezervasyonlar(data);
    } catch {
      toast.error('Rezervasyonlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Rezervasyonlarım</h1>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-300 bg-white shadow rounded">
          <thead>
            <tr>
              <th className="px-4 py-2">Müşteri</th>
              <th className="px-4 py-2">Oda</th>
              <th className="px-4 py-2">Giriş</th>
              <th className="px-4 py-2">Çıkış</th>
              <th className="px-4 py-2">Durum</th>
            </tr>
          </thead>
          <tbody>
            {rezervasyonlar.map((rez) => (
              <tr key={rez.id}>
                <td className="px-4 py-2">
                  {rez.user?.firstName || rez.musteri?.ad} {rez.user?.lastName || rez.musteri?.soyad}
                </td>
                <td className="px-4 py-2">
                  {rez.room?.number || rez.oda?.numara} - {rez.room?.type || rez.oda?.tip}
                </td>
                <td className="px-4 py-2">
                  {rez.checkIn || rez.girisTarihi}
                </td>
                <td className="px-4 py-2">
                  {rez.checkOut || rez.cikisTarihi}
                </td>
                <td className="px-4 py-2">
                  {rez.status || rez.durum}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
