import React, { useEffect, useState } from 'react';
import { otelService as hotelService } from '../../services/api';
import { toast } from 'react-toastify';

interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
}

export default function AdminHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const data = await hotelService.getAll();
      setHotels(data);
    } catch {
      toast.error('Oteller yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Otel silinsin mi?')) return;
    try {
      await hotelService.delete(Number(id));
      setHotels(hotels.filter(h => h.id !== id));
      toast.success('Otel silindi');
    } catch {
      toast.error('Otel silinemedi');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Oteller</h1>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-300 bg-white shadow rounded">
          <thead>
            <tr>
              <th className="px-4 py-2">Ad</th>
              <th className="px-4 py-2">Adres</th>
              <th className="px-4 py-2">Şehir</th>
              <th className="px-4 py-2">Ülke</th>
              <th className="px-4 py-2">Puan</th>
              <th className="px-4 py-2">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map(h => (
              <tr key={h.id}>
                <td className="px-4 py-2">{h.name}</td>
                <td className="px-4 py-2">{h.address}</td>
                <td className="px-4 py-2">{h.city}</td>
                <td className="px-4 py-2">{h.country}</td>
                <td className="px-4 py-2">{h.rating ?? '-'}</td>
                <td className="px-4 py-2">
                  {/* Edit functionality can be added here */}
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="text-red-600 hover:underline"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
