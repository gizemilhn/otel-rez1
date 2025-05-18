import React, { useEffect, useState } from 'react';
import { odaService } from '../../services/api';
import { toast } from 'react-toastify';

interface Room {
  id: string;
  number: string;
  type: string;
  price: number;
  capacity: number;
  description?: string;
  status: string;
  hotel: {
    name: string;
  };
}

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await odaService.getAll();
      setRooms(data);
    } catch {
      toast.error('Odalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Oda silinsin mi?')) return;
    try {
      await odaService.delete(Number(id));
      setRooms(rooms.filter(r => r.id !== id));
      toast.success('Oda silindi');
    } catch {
      toast.error('Oda silinemedi');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Odalar</h1>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-300 bg-white shadow rounded">
          <thead>
            <tr>
              <th className="px-4 py-2">Oda No</th>
              <th className="px-4 py-2">Tip</th>
              <th className="px-4 py-2">Fiyat</th>
              <th className="px-4 py-2">Kapasite</th>
              <th className="px-4 py-2">Durum</th>
              <th className="px-4 py-2">Otel</th>
              <th className="px-4 py-2">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(r => (
              <tr key={r.id}>
                <td className="px-4 py-2">{r.number}</td>
                <td className="px-4 py-2">{r.type}</td>
                <td className="px-4 py-2">{r.price}</td>
                <td className="px-4 py-2">{r.capacity}</td>
                <td className="px-4 py-2">{r.status}</td>
                <td className="px-4 py-2">{r.hotel?.name}</td>
                <td className="px-4 py-2">
                  {/* Edit functionality can be added here */}
                  <button
                    onClick={() => handleDelete(r.id)}
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
