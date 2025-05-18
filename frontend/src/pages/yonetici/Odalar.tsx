import React, { useEffect, useState } from 'react';
import { odaService } from '../../services/api';
import { toast } from 'react-toastify';

export default function YoneticiOdalar() {
  const [odalar, setOdalar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOdalar();
  }, []);

  const fetchOdalar = async () => {
    setLoading(true);
    try {
      const data = await odaService.getAll();
      setOdalar(data);
    } catch {
      toast.error('Odalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Odalarım</h1>
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
            </tr>
          </thead>
          <tbody>
            {odalar.map((oda) => (
              <tr key={oda.id}>
                <td className="px-4 py-2">{oda.numara || oda.number}</td>
                <td className="px-4 py-2">{oda.tip || oda.type}</td>
                <td className="px-4 py-2">{oda.fiyat || oda.price}</td>
                <td className="px-4 py-2">{oda.kapasite || oda.capacity}</td>
                <td className="px-4 py-2">{oda.durum || oda.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
