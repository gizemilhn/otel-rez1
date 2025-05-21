import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { hotelService } from '../../services/api';

interface Hotel {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  description: string | null;
  imageUrl: string | null;
  rating: number | null;
}

export default function Otel() {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchHotel();
  }, []);

  const fetchHotel = async () => {
    try {
      const data = await hotelService.getMyHotel();
      setHotel(data);
      setFormData({
        name: data.name,
        address: data.address,
        city: data.city,
        country: data.country,
        description: data.description || '',
        imageUrl: data.imageUrl || '',
      });
    } catch (error) {
      toast.error('Otel bilgileri yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedHotel = await hotelService.updateMyHotel(formData);
      setHotel(updatedHotel);
      setEditing(false);
      toast.success('Otel bilgileri başarıyla güncellendi.');
    } catch (error) {
      toast.error('Otel bilgileri güncellenirken bir hata oluştu.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Otel Bilgileri</h3>
            <button
              onClick={() => setEditing(!editing)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {editing ? 'İptal' : 'Düzenle'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Otel Adı
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Adres
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Şehir
                  </label>
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Ülke
                  </label>
                  <input
                    type="text"
                    name="country"
                    id="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  Görsel URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Kaydet
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Otel Adı</h4>
                <p className="mt-1 text-sm text-gray-900">{hotel?.name}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Adres</h4>
                <p className="mt-1 text-sm text-gray-900">{hotel?.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Şehir</h4>
                  <p className="mt-1 text-sm text-gray-900">{hotel?.city}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Ülke</h4>
                  <p className="mt-1 text-sm text-gray-900">{hotel?.country}</p>
                </div>
              </div>

              {hotel?.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Açıklama</h4>
                  <p className="mt-1 text-sm text-gray-900">{hotel.description}</p>
                </div>
              )}

              {hotel?.imageUrl && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Görsel</h4>
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    className="mt-2 h-48 w-full object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 