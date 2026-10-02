import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const SERVICES = [
  { name: 'Ăn sáng buffet', price: 100000, icon: '🍳' },
  { name: 'Đưa đón sân bay', price: 200000, icon: '🚗' },
  { name: 'Spa & Massage', price: 300000, icon: '💆' },
  { name: 'Giặt ủi', price: 50000, icon: '👕' },
  { name: 'Thuê xe máy', price: 150000, icon: '🏍️' },
  { name: 'Tour du lịch', price: 500000, icon: '🗺️' }
];

const EXTRA_ADULT_FEE = 200000;
const EXTRA_CHILD_6_12_FEE = 100000;

export default function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState({
    checkInDate: '',
    checkOutDate: '',
    paymentMethod: 'CASH',
    specialRequests: '',
    services: [],
    adults: 1,
    childrenUnder6: 0,
    children6to12: 0,
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    guestIdCard: ''
  });

  useEffect(() => {
    api.get(`/rooms/${id}`)
      .then(({ data }) => setRoom(data.data))
      .catch(() => toast.error('Không tải được phòng'));
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const calcNights = () => {
    if (!booking.checkInDate || !booking.checkOutDate) return 0;
    const n = Math.ceil(
      (new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 60 * 60 * 24)
    );
    return n > 0 ? n : 0;
  };

  const calcRoomPrice = () => calcNights() * (room ? parseFloat(room.price) : 0);

  const calcServicesPrice = () => {
    return booking.services.reduce((sum, name) => {
      const svc = SERVICES.find(s => s.name === name);
      return sum + (svc ? svc.price : 0);
    }, 0);
  };

  // 👥 Sức chứa hiệu dụng = người lớn + trẻ 6-12 (KHÔNG tính trẻ < 6)
  const effectiveOccupancy = booking.adults + booking.children6to12;
  const baseCapacity = room ? (room.capacity || 2) : 2;
  const extraAdults = Math.max(0, effectiveOccupancy - baseCapacity);

  const calcExtraAdultsFee = () => extraAdults * EXTRA_ADULT_FEE * calcNights();
  const calcExtraChildrenFee = () => booking.children6to12 * EXTRA_CHILD_6_12_FEE * calcNights();
  const calcExtraFee = () => calcExtraAdultsFee() + calcExtraChildrenFee();

  const calcTotal = () => calcRoomPrice() + calcServicesPrice() + calcExtraFee();

  const toggleService = (name) => {
    setBooking(prev => ({
      ...prev,
      services: prev.services.includes(name)
        ? prev.services.filter(s => s !== name)
        : [...prev.services, name]
    }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt phòng');
      navigate('/login');
      return;
    }
    if (!booking.guestName || !booking.guestPhone) {
      toast.error('Vui lòng nhập tên và SĐT khách hàng');
      return;
    }
    if (calcNights() <= 0) {
      toast.error('Vui lòng chọn ngày hợp lệ');
      return;
    }
    try {
      await api.post('/bookings', { ...booking, roomId: id });
      toast.success('Đặt phòng thành công!');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt phòng thất bại');
    }
  };

  if (!room) {
    return <div className="container mx-auto px-4 py-16 text-center text-gray-500">Đang tải...</div>;
  }

  const nights = calcNights();

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/rooms" className="text-primary hover:underline mb-4 inline-block">
        ← Quay lại danh sách phòng
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bên trái */}
        <div>
          <img
            src={room.image}
            alt={room.type}
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
          <div className="mt-6">
            <h1 className="text-3xl font-bold text-dark mb-2">
              Phòng {room.roomNumber} - {room.type}
            </h1>
            <p className="text-2xl text-secondary font-bold mb-4">
              {formatPrice(room.price)}/đêm
            </p>
            <p className="text-gray-700 mb-4">{room.description}</p>

            <div className="mb-4 space-y-1">
              <p className="font-medium text-dark">👥 Sức chứa: {room.capacity} người</p>
              <p className="font-medium text-dark">
                🛏️ Giường: {room.bedCount || 1} giường ({room.bedType || 'Giường đôi'})
              </p>
              {room.extraBed && (
                <p className="font-medium text-green-600 text-sm">✓ Có thể kê thêm giường phụ</p>
              )}
              <p className="font-medium text-dark">
                Trạng thái:{' '}
                <span className={room.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-600'}>
                  {room.status === 'AVAILABLE' ? 'Còn phòng' : 'Đã đặt'}
                </span>
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2 text-dark">🛎️ Tiện nghi phòng:</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(room.amenities) && room.amenities.map((a, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
              <p className="font-bold text-orange-800 mb-2">💰 Phụ thu</p>
              <div className="text-sm space-y-1 text-orange-700">
                <p>• 👤 Người lớn vượt sức chứa: <span className="font-bold">+200.000đ/người/đêm</span></p>
                <p>• 🧒 Trẻ 6-12 tuổi: <span className="font-bold">+100.000đ/trẻ/đêm</span></p>
                <p>• 👶 Trẻ dưới 6 tuổi: <span className="font-bold text-green-600">Miễn phí</span> (không tính sức chứa)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bên phải: Form */}
        <div className="card p-6 h-fit sticky top-24">
          <h2 className="text-2xl font-bold mb-4 text-dark">📝 Đặt phòng</h2>
          <form onSubmit={handleBooking} className="space-y-4">

            {/* THÔNG TIN KHÁCH HÀNG */}
            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
              <p className="font-bold text-blue-800 mb-3">👤 Thông tin khách hàng</p>
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Tên khách <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="VD: Nguyễn Văn A"
                    value={booking.guestName}
                    onChange={(e) => setBooking({ ...booking, guestName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    SĐT khách <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="VD: 0987654321"
                    value={booking.guestPhone}
                    onChange={(e) => setBooking({ ...booking, guestPhone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Email khách</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="VD: khach@email.com"
                    value={booking.guestEmail}
                    onChange={(e) => setBooking({ ...booking, guestEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">CMND/CCCD</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="VD: 001234567890"
                    value={booking.guestIdCard}
                    onChange={(e) => setBooking({ ...booking, guestIdCard: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 🆕 SỐ NGƯỜI — 3 Ô */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block mb-1 font-medium text-xs">👤 Người lớn</label>
                <input
                  type="number"
                  min="1"
                  className="input-field text-sm"
                  value={booking.adults}
                  onChange={(e) => setBooking({ ...booking, adults: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-xs">👶 Trẻ &lt; 6t</label>
                <input
                  type="number"
                  min="0"
                  className="input-field text-sm"
                  value={booking.childrenUnder6}
                  onChange={(e) => setBooking({ ...booking, childrenUnder6: parseInt(e.target.value) || 0 })}
                />
                {booking.childrenUnder6 > 0 && (
                  <p className="text-xs text-green-600 mt-1 font-medium">✓ Miễn phí</p>
                )}
              </div>
              <div>
                <label className="block mb-1 font-medium text-xs">🧒 Trẻ 6-12t</label>
                <input
                  type="number"
                  min="0"
                  className="input-field text-sm"
                  value={booking.children6to12}
                  onChange={(e) => setBooking({ ...booking, children6to12: parseInt(e.target.value) || 0 })}
                />
                {booking.children6to12 > 0 && (
                  <p className="text-xs text-orange-600 mt-1 font-medium">+100k/đêm</p>
                )}
              </div>
            </div>

            {/* Hiển thị sức chứa */}
            <p className="text-xs text-gray-500">
              Sức chứa hiệu dụng: <span className="font-bold">{effectiveOccupancy}/{baseCapacity}</span>
              {extraAdults > 0 && <span className="text-orange-600"> — Vượt {extraAdults} người</span>}
            </p>

            {/* KHỐI PHỤ THU */}
            {calcExtraFee() > 0 && (
              <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-4">
                <p className="font-bold text-orange-800 mb-2">⚠️ Phụ thu phát sinh</p>
                <div className="text-sm text-orange-700 space-y-1">
                  {extraAdults > 0 && (
                    <p>
                      • Người lớn vượt sức chứa: <span className="font-bold">
                        {extraAdults} × 200.000đ × {nights} đêm = {formatPrice(calcExtraAdultsFee())}
                      </span>
                    </p>
                  )}
                  {booking.children6to12 > 0 && (
                    <p>
                      • Trẻ 6-12 tuổi: <span className="font-bold">
                        {booking.children6to12} × 100.000đ × {nights} đêm = {formatPrice(calcExtraChildrenFee())}
                      </span>
                    </p>
                  )}
                </div>
                <p className="text-sm font-bold text-orange-800 mt-2 pt-2 border-t border-orange-300">
                  Tổng phụ thu: {formatPrice(calcExtraFee())}
                </p>
              </div>
            )}

            {/* Ngày */}
            <div>
              <label className="block mb-1 font-medium">📅 Ngày nhận phòng</label>
              <input
                type="date"
                className="input-field"
                value={booking.checkInDate}
                onChange={(e) => setBooking({ ...booking, checkInDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">📅 Ngày trả phòng</label>
              <input
                type="date"
                className="input-field"
                value={booking.checkOutDate}
                onChange={(e) => setBooking({ ...booking, checkOutDate: e.target.value })}
                required
              />
            </div>

            {/* Dịch vụ */}
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
              <p className="font-bold text-blue-800 mb-3">🎁 Dịch vụ đi kèm</p>
              <div className="grid grid-cols-2 gap-2">
                {SERVICES.map((svc) => (
                  <label
                    key={svc.name}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition text-sm ${
                      booking.services.includes(svc.name)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-blue-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={booking.services.includes(svc.name)}
                      onChange={() => toggleService(svc.name)}
                      className="hidden"
                    />
                    <span>{svc.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{svc.name}</p>
                      <p className={`text-xs ${booking.services.includes(svc.name) ? 'text-blue-100' : 'text-gray-500'}`}>
                        +{formatPrice(svc.price)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Thanh toán */}
            <div>
              <label className="block mb-1 font-medium">💳 Phương thức thanh toán</label>
              <select
                className="input-field"
                value={booking.paymentMethod}
                onChange={(e) => setBooking({ ...booking, paymentMethod: e.target.value })}
              >
                <option value="CASH">Thanh toán tại khách sạn</option>
                <option value="VNPAY">VNPay</option>
                <option value="MOMO">Momo</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">📝 Yêu cầu đặc biệt</label>
              <textarea
                className="input-field"
                rows="2"
                placeholder="Ví dụ: Phòng tầng cao, view đẹp..."
                value={booking.specialRequests}
                onChange={(e) => setBooking({ ...booking, specialRequests: e.target.value })}
              ></textarea>
            </div>

            {/* Tổng */}
            <div className="bg-gray-100 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tiền phòng ({nights} đêm):</span>
                <span className="font-medium">{formatPrice(calcRoomPrice())}</span>
              </div>
              <div className="flex justify-between">
                <span>Dịch vụ ({booking.services.length}):</span>
                <span className="font-medium">{formatPrice(calcServicesPrice())}</span>
              </div>
              {calcExtraFee() > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>👥 Phụ thu:</span>
                  <span className="font-medium">{formatPrice(calcExtraFee())}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                <span>TỔNG:</span>
                <span className="text-secondary">{formatPrice(calcTotal())}</span>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full text-lg py-3">
              ✅ Xác nhận đặt phòng
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}