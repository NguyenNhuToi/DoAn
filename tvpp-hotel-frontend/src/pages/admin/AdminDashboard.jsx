import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  const menuItems = [
    { icon: '👥', title: 'Quản lý người dùng', desc: 'Thêm/sửa/xóa tài khoản', link: '/admin/users', color: 'bg-blue-500' },
    { icon: '🛏️', title: 'Quản lý phòng', desc: 'Thêm/sửa/xóa phòng', link: '/admin/rooms', color: 'bg-green-500' },
    { icon: '📋', title: 'Quản lý đơn đặt', desc: 'Xem và xử lý đơn', link: '/admin/bookings', color: 'bg-yellow-500' },
    { icon: '📊', title: 'Báo cáo thống kê', desc: 'Doanh thu, hoạt động', link: '/admin/reports', color: 'bg-purple-500' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-linear-to-r from-purple-600 to-purple-800 text-white rounded-2xl p-6 mb-8">
        <h1 className="text-3xl font-bold">👑 Bảng điều khiển Admin</h1>
        <p className="text-purple-100 mt-2">
          Xin chào, <strong>{user?.name}</strong>! Chào mừng bạn đến trang quản trị.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item, i) => (
          <Link
            key={i}
            to={item.link}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition border-2 border-gray-100 hover:border-purple-300"
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