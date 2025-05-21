import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { roomService } from '../../services/api';

interface Room {
  id: string;
  number: string;
  type: string;
  capacity: number;
  price: number;
  description: string | null;
  imageUrl: string | null;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

export default function Odalar() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    type: '',
    capacity: 1,
    price: 0,
    description: '',
    imageUrl: '',
    status: 'AVAILABLE' as 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomService.getMyHotelRooms();
      setRooms(data);
    } catch (error) {
      toast.error('Odalar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await roomService.updateMyHotelRoom(editingRoom.id, formData);
        toast.success('Oda başarıyla güncellendi.');
      } else {
        await roomService.createMyHotelRoom(formData);
        toast.success('Oda başarıyla eklendi.');
      }
      setShowModal(false);
      setEditingRoom(null);
      fetchRooms();
    } catch (error) {
      toast.error(editingRoom ? 'Oda güncellenirken bir hata oluştu.' : 'Oda eklenirken bir hata oluştu.');
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      number: room.number,
      type: room.type,
      capacity: room.capacity,
      price: room.price,
      description: room.description || '',
      imageUrl: room.imageUrl || '',
      status: room.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu odayı silmek istediğinizden emin misiniz?')) {
      try {
        await roomService.deleteMyHotelRoom(id);
        toast.success('Oda başarıyla silindi.');
        fetchRooms();
      } catch (error) {
        toast.error('Oda silinirken bir hata oluştu.');
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' || name === 'price' ? Number(value) : value,
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Odalar</h1>
        <button
          onClick={() => {
            setEditingRoom(null);
            setFormData({
              number: '',
              type: '',
              capacity: 1,
              price: 0,
              description: '',
              imageUrl: '',
              status: 'AVAILABLE',
            });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Yeni Oda Ekle
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <ul className="divide-y divide-gray-200">
          {rooms.map((room) => (
            <li key={room.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-16 w-16">
                      {room.imageUrl ? (
                        <img
                          src={room.imageUrl}
                          alt={room.number}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Oda {room.number} - {room.type}
                      </h3>
                      <p className="text-sm text-gray-500">{room.description}</p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Kapasite: {room.capacity} kişi
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        Fiyat: {room.price} TL/gece
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        room.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        room.status === 'OCCUPIED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {room.status === 'AVAILABLE' ? 'Müsait' :
                         room.status === 'OCCUPIED' ? 'Dolu' :
                         'Bakımda'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  <button
                    onClick={() => handleEdit(room)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(room.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingRoom ? 'Oda Düzenle' : 'Yeni Oda Ekle'}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Oda Numarası</label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Oda Tipi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Tip Seçin</option>
                    <option value="STANDARD">Standart</option>
                    <option value="DELUXE">Deluxe</option>
                    <option value="SUITE">Suit</option>
                    <option value="FAMILY">Aile</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Kapasite</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    min="1"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Fiyat (TL/gece)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Görsel URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Durum</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="AVAILABLE">Müsait</option>
                    <option value="OCCUPIED">Dolu</option>
                    <option value="MAINTENANCE">Bakımda</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    {editingRoom ? 'Güncelle' : 'Ekle'}
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
