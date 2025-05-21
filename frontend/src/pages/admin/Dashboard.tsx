import { useEffect, useState } from 'react';
import { FaHotel, FaUsers, FaBed, FaCalendarAlt } from 'react-icons/fa';
import api from '../../config/axios';

interface DashboardStats {
  totalHotels: number;
  totalUsers: number;
  totalRooms: number;
  totalReservations: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalHotels: 0,
    totalUsers: 0,
    totalRooms: 0,
    totalReservations: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [hotels, users, rooms, reservations] = await Promise.all([
          api.get('/admin/hotels'),
          api.get('/admin/users'),
          api.get('/admin/rooms'),
          api.get('/admin/reservations'),
        ]);

        setStats({
          totalHotels: hotels.data.length,
          totalUsers: users.data.length,
          totalRooms: rooms.data.length,
          totalReservations: reservations.data.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Toplam Otel',
      value: stats.totalHotels,
      icon: <FaHotel className="h-8 w-8" />,
      color: 'bg-blue-500',
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: <FaUsers className="h-8 w-8" />,
      color: 'bg-green-500',
    },
    {
      title: 'Toplam Oda',
      value: stats.totalRooms,
      icon: <FaBed className="h-8 w-8" />,
      color: 'bg-purple-500',
    },
    {
      title: 'Toplam Rezervasyon',
      value: stats.totalReservations,
      icon: <FaCalendarAlt className="h-8 w-8" />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`${card.color} rounded-lg p-6 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 