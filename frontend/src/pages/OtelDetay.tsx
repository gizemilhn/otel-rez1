import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Wifi, Car, Waves, Utensils, Calendar, Users } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { otelService, roomService, reservationService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface Room {
  id: string;
  number: string;
  type: string;
  description: string;
  price: number;
  imageUrl: string | null;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  rating: number;
  imageUrl: string | null;
  features: Array<{ icon: string; text: string }>;
  rooms: Room[];
  price: number;
}

const iconMap: { [key: string]: React.ElementType } = {
  'Ücretsiz Wi-Fi': Wifi,
  'Wi-Fi': Wifi,
  'Wifi': Wifi,
  'Ücretsiz Otopark': Car,
  'Otopark': Car,
  'Parking': Car,
  'Havuz': Waves,
  'Pool': Waves,
  'Restoran': Utensils,
  'Restaurant': Utensils,
  'Yemek': Utensils,
};

export default function OtelDetay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<Date>(new Date());
  const [checkOut, setCheckOut] = useState<Date>(addDays(new Date(), 1));
  const [guestCount, setGuestCount] = useState(1);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      const hotelData = await otelService.getById(id!);
      setHotel(hotelData);
      setRooms(hotelData.rooms);
      setError(null);
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      setError('Otel detayları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async (room: Room) => {
    if (!user) {
      toast.error('Rezervasyon yapmak için giriş yapmalısınız.');
      navigate('/giris');
      return;
    }

    setSelectedRoom(room);
    setShowReservationModal(true);
  };

  const handleSubmitReservation = async () => {
    if (!selectedRoom) return;

    try {
      const nights = differenceInDays(checkOut, checkIn);
      const totalPrice = selectedRoom.price * nights;

      await reservationService.create({
        roomId: selectedRoom.id,
        checkIn,
        checkOut,
        guestCount,
        totalPrice,
        specialRequests,
      });

      toast.success('Rezervasyonunuz başarıyla oluşturuldu.');
      setShowReservationModal(false);
      fetchHotelDetails(); // Refresh room availability
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Rezervasyon oluşturulurken bir hata oluştu.');
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  if (error || !hotel) {
    return <div className="text-red-500">{error || 'Otel bulunamadı.'}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        <div>
          {hotel.imageUrl ? (
            <img
              src={hotel.imageUrl}
              alt={hotel.name}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-gray-400">Görsel yok</span>
            </div>
          )}
        </div>
        <div className="mt-8 lg:mt-0">
          <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
          <div className="mt-2 flex items-center text-gray-500">
            <MapPin className="h-5 w-5 mr-1" />
            <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(hotel.rating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill={i < Math.floor(hotel.rating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">{hotel.rating.toFixed(1)}</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-gray-900">
              {hotel.price} TL <span className="text-base font-normal text-gray-500">/gece</span>
            </p>
          </div>
          <p className="mt-4 text-gray-600">{hotel.description}</p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {hotel.features && hotel.features.map((feature, index) => {
              const Icon = iconMap[feature.icon];
              return (
                <div key={index} className="flex items-center text-gray-600">
                  {Icon ? <Icon className="h-5 w-5 mr-2" /> : null}
                  <span>{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Müsait Odalar</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => {
            const nights = differenceInDays(checkOut, checkIn);
            const totalPrice = room.price * nights;
            const isAvailable = room.status === 'AVAILABLE' && guestCount <= room.capacity;

            return (
              <div key={room.id} className="bg-white rounded-lg shadow overflow-hidden">
                {room.imageUrl ? (
                  <img
                    src={room.imageUrl}
                    alt={`Oda ${room.number}`}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Görsel yok</span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Oda {room.number} - {room.type}
                  </h3>
                  <p className="mt-2 text-gray-600">{room.description}</p>
                  <div className="mt-4 flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-1" />
                    <span>Maksimum {room.capacity} kişi</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{room.price} TL/gece</p>
                      <p className="text-sm text-gray-500">{totalPrice} TL toplam</p>
                    </div>
                    <button
                      onClick={() => handleReservation(room)}
                      disabled={!isAvailable}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        isAvailable
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isAvailable ? 'Rezervasyon Yap' : 'Müsait Değil'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showReservationModal && selectedRoom && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rezervasyon Yap</h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitReservation(); }}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Giriş Tarihi</label>
                  <input
                    type="date"
                    value={format(checkIn, 'yyyy-MM-dd')}
                    onChange={(e) => setCheckIn(new Date(e.target.value))}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Çıkış Tarihi</label>
                  <input
                    type="date"
                    value={format(checkOut, 'yyyy-MM-dd')}
                    onChange={(e) => setCheckOut(new Date(e.target.value))}
                    min={format(addDays(checkIn, 1), 'yyyy-MM-dd')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Kişi Sayısı</label>
                  <input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value))}
                    min={1}
                    max={selectedRoom.capacity}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-700">
                    Toplam Fiyat: {selectedRoom.price * differenceInDays(checkOut, checkIn)} TL
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Özel İstekler (Opsiyonel)</label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    rows={3}
                    placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowReservationModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    Rezervasyon Yap
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}