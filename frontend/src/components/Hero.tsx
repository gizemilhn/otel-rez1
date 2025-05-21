import React from 'react';

export default function Hero() {
  return (
    <div className="relative">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          className="h-full w-full object-cover"
          src="/images/hero-bg.jpg"
          alt="Luxury hotel background"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-32 sm:py-40 lg:py-48">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            <span className="block">Hayalinizdeki Tatili</span>
            <span className="block text-primary-400">Keşfedin</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-100 sm:text-xl">
            Türkiye'nin en iyi otellerini keşfedin, en uygun fiyatlarla rezervasyon yapın.
            Unutulmaz bir tatil deneyimi için hemen başlayın.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">500+</div>
            <div className="mt-2 text-base text-gray-200">Aktif Otel</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">100K+</div>
            <div className="mt-2 text-base text-gray-200">Mutlu Müşteri</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white">81</div>
            <div className="mt-2 text-base text-gray-200">Şehir</div>
          </div>
        </div>
      </div>
    </div>
  );
}