import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function RoomCard({ room }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleQuickBook = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt phòng');
      navigate('/login');
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      await api.post('/bookings', {
        roomId: room.id,
        checkInDate: today.toISOString().split('T')[0],
        checkOutDate: tomorrow.toISOString().split('T')[0],
        paymentMethod: 'CASH',
        specialRequests: 'Đặt nhanh',
        guestName: user.name || 'Khách',
        guestPhone: 'Chưa có',
        adults: 1,
        childrenUnder6: 0,
        children6to12: 0
      });
      toast.success('Đặt phòng thành công!');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt phòng thất bại');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
      {/* Ảnh + badge */}
      <div className="relative">
        <img
          src={room.image || 'https://via.placeholder.com/400x300'}
          alt={room.type}
          className="w-full h-52 object-cover"
        />
        <span
          className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-semibold shadow-md ${
            room.status === 'AVAILABLE'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {room.status === 'AVAILABLE' ? '🟢 Còn phòng' : '🔴 Đã đặt'}
        </span>
      </div>

      {/* Nội dung */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-dark mb-2">
          Phòng {room.roomNumber} - {room.type}
        </h3>

        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {room.description}
        </p>

        {/* Thông tin giường + sức chứa */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">👥 {room.capacity} người</span>
          <span className="flex items-center gap-1">🛏️ {room.bedCount || 1} giường</span>
          <span className="flex items-center gap-1">{room.bedType || 'Giường đôi'}</span>
        </div>

        {/* Giá */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-secondary">
            {formatPrice(room.price)}
          </span>
          <span className="text-gray-500 text-sm"> / đêm</span>
        </div>

        {/* 2 nút */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Link
            to={`/rooms/${room.id}`}
            className="text-center bg-gray-100 text-gray-700 py-2.5 rounded-lg hover:bg-gray-200 transition text-sm font-medium border border-gray-200"
          >
            👁️ Chi tiết
          </Link>
          <button
            onClick={handleQuickBook}
            className="bg-primary text-white py-2.5 rounded-lg hover:bg-blue-800 transition text-sm font-medium shadow-sm"
          >
            🛎️ Đặt phòng
          </button>
        </div>
      </div>
    </div>
  );
}