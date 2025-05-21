import { Link, useLocation } from 'react-router-dom';
import { FaHotel, FaUsers, FaBed, FaCalendarAlt } from 'react-icons/fa';

const AdminSidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/admin/hotels', icon: <FaHotel />, label: 'Oteller' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Kullanıcılar' },
    { path: '/admin/rooms', icon: <FaBed />, label: 'Odalar' },
    { path: '/admin/reservations', icon: <FaCalendarAlt />, label: 'Rezervasyonlar' },
  ];

  return (
    <div className="w-64 bg-gray-800 min-h-screen p-4">
      <div className="text-white text-xl font-bold mb-8">Admin Panel</div>
      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar; 