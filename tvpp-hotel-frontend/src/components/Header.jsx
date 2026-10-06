import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    navigate('/');
  };

  // 🆕 Icon theo vai trò
  const getRoleIcon = () => {
    if (!user) return '👤';
    if (user.role === 'ADMIN') return '👑';
    if (user.role === 'RECEPTIONIST') return '🛎️';
    return '👤'; // CUSTOMER
  };

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo + Tên khách sạn */}
        <Link to="/" className="text-2xl font-bold flex items-center gap-3">
          <img
            src="/Logo.png"
            alt="TVPP Hotel"
            className="h-12 w-auto"
          />
          <span>TVPP HOTEL</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/" className="hover:text-secondary transition">Trang chủ</Link>
          <Link to="/rooms" className="hover:text-secondary transition">Phòng</Link>

          {user ? (
            <>
              {/* 🆕 Menu theo vai trò */}
              {user.role === 'CUSTOMER' && (
                <Link to="/my-bookings" className="hover:text-secondary transition">
                  Đơn của tôi
                </Link>
              )}

              {user.role === 'ADMIN' && (
                <Link to="/admin" className="hover:text-secondary transition">
                  👑 Quản trị
                </Link>
              )}

              {user.role === 'RECEPTIONIST' && (
                <Link to="/staff" className="hover:text-secondary transition">
                  🛎️ Lễ tân
                </Link>
              )}

              {/* 🆕 Badge user — Icon đổi theo vai trò */}
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:text-secondary transition"
                title="Xem trang cá nhân"
              >
                <span className="text-sm">{getRoleIcon()} {user.name}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-lg text-sm transition"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-secondary transition">
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-secondary hover:bg-yellow-600 px-4 py-2 rounded-lg transition"
              >
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}