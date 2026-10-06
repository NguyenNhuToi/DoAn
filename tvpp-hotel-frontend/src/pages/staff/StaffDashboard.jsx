import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    checkedIn: 0,
    available: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/bookings');
        const bookings = data.data;

        setStats({
          pending: bookings.filter(b => b.status === 'PENDING').length,
          confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
          checkedIn: bookings.filter(b => b.status === 'CHECKED_IN').length,
          available: 0
        });

        // Lấy số phòng trống
        const roomsRes = await api.get('/rooms');
        setStats(prev => ({
          ...prev,
          available: roomsRes.data.data.filter(r => r.status === 'AVAILABLE').length
        }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const menuItems = [
    {
      icon: '📋',
      title: 'Quản lý đơn đặt',
      desc: 'Xem và xử lý tất cả đơn',
      link: '/staff/bookings',
      color: 'bg-blue-500'
    },
    {
      icon: '🏨',
      title: 'Danh sách phòng',
      desc: 'Xem tình trạng phòng',
      link: '/rooms',
      color: 'bg-green-500'
    },
    {
      icon: '✅',
      title: 'Xác nhận đơn',
      desc: 'Duyệt đơn chờ xác nhận',
      link: '/staff/bookings?filter=PENDING',
      color: 'bg-yellow-500'
    },
    {
      icon: '👋',
      title: 'Check-out',
      desc: 'Khách trả phòng',
      link: '/staff/bookings?filter=CHECKED_IN',
      color: 'bg-purple-500'
    }
  ];

  if (loading) return <p className="text-center py-16 text-gray-500">Đang tải...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-linear-to-r from-yellow-500 to-yellow-700 text-white rounded-2xl p-6 mb-8">
        <h1 className="text-3xl font-bold">🛎️ Trang Lễ Tân</h1>
        <p className="text-yellow-100 mt-2">
          Xin chào, <strong>{user?.name}</strong>! Chúc bạn một ngày làm việc hiệu quả.
        </p>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">⏳</div>
          <p className="text-xs text-gray-500">Đơn chờ xác nhận</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">✅</div>
          <p className="text-xs text-gray-500">Đã xác nhận</p>
          <p className="text-2xl font-bold text-blue-700">{stats.confirmed}</p>
        </div>
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">🏨</div>
          <p className="text-xs text-gray-500">Đang ở</p>
          <p className="text-2xl font-bold text-green-700">{stats.checkedIn}</p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4 text-center">
          <div className="text-3xl mb-1">🛏️</div>
          <p className="text-xs text-gray-500">Phòng trống</p>
          <p className="text-2xl font-bold text-purple-700">{stats.available}</p>
        </div>
      </div>

      {/* Menu chức năng */}
      <h2 className="text-2xl font-bold text-dark mb-4">Chức năng chính</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item, i) => (
          <Link
            key={i}
            to={item.link}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition border-2 border-gray-100 hover:border-yellow-300"
          >
            <div className={`${item.color} text-white w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-4`}>
              {item.icon}
            </div>
            <h3 className="font-bold text-lg mb-1 text-dark">{item.title}</h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}