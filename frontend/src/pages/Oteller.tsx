import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Star, MapPin } from 'lucide-react';
import { otelService } from '../services/api';
import { toast } from 'react-toastify';

interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  imageUrl: string;
  price: number;
}

export default function Oteller() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await otelService.getAll();
      setHotels(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching hotels:', err);
      setError('Oteller yüklenirken bir hata oluştu.');
      toast.error('Oteller yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchHotels}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Oteller</h1>
        <p className="mt-2 text-gray-600">En iyi otelleri keşfedin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
          >
            <div className="relative h-48">
              <img
                src={hotel.imageUrl}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                ₺{hotel.price}/gece
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">{hotel.name}</h3>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-gray-600">{hotel.rating}</span>
                </div>
              </div>
              <div className="mt-2 flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-1" />
                <span>{hotel.address}, {hotel.city}</span>
              </div>
              <p className="mt-4 text-gray-600 line-clamp-2">{hotel.description}</p>
              <Link
                to={`/oteller/${hotel.id}`}
                className="mt-6 block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Detayları Gör
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
