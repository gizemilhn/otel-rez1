import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import OtelCard from '../components/OtelCard';
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

export default function AnaSayfa() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const data = await otelService.getAll();
      setHotels(data);
    } catch (error) {
      toast.error('Oteller yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Hero />
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Öne Çıkan Oteller</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((hotel) => (
            <OtelCard
              key={hotel.id}
              id={hotel.id}
              name={hotel.name}
              description={hotel.description}
              address={hotel.address}
              city={hotel.city}
              country={hotel.country}
              rating={hotel.rating}
              imageUrl={hotel.imageUrl}
              price={hotel.price}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">
              Daha Hızlı Rezervasyon
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Neden Bizi Tercih Etmelisiniz?
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Güvenilir, hızlı ve kolay rezervasyon deneyimi için doğru adrestesiniz.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {[
                {
                  name: 'Güvenli Ödeme',
                  description: 'SSL sertifikalı güvenli ödeme sistemi ile güvenle ödeme yapın.',
                },
                {
                  name: '7/24 Destek',
                  description: 'Müşteri hizmetlerimiz her zaman yanınızda.',
                },
                {
                  name: 'En İyi Fiyat Garantisi',
                  description: 'Aynı otel için daha uygun fiyat bulursanız fark iadesi.',
                },
              ].map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    {feature.name}
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 