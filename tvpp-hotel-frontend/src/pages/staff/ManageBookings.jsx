import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  PENDING: { text: '⏳ Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  CONFIRMED: { text: '✅ Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  CHECKED_IN: { text: '🏨 Đang ở', color: 'bg-green-100 text-green-700 border-green-300' },
  CHECKED_OUT: { text: '👋 Đã trả phòng', color: 'bg-gray-100 text-gray-700 border-gray-300' },
  CANCELLED: { text: '❌ Đã hủy', color: 'bg-red-100 text-red-700 border-red-300' }
};

const PAYMENT_METHOD_MAP = {
  CASH: '💵 Tiền mặt',
  VNPAY: '🏦 VNPay',
  MOMO: '📱 MoMo',
  BANK: '🏛️ Chuyển khoản'
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'ALL';
  const [filter, setFilter] = useState(initialFilter);
  const [expandedId, setExpandedId] = useState(null);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data.data);
    } catch (err) {
      toast.error('Không tải được danh sách đơn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    if (filter === 'ALL') {
      setFiltered(bookings);
    } else {
      setFiltered(bookings.filter(b => b.status === filter));
    }
  }, [filter, bookings]);

  // Cập nhật trạng thái đơn
  const handleUpdateStatus = async (id, newStatus) => {
    const statusText = STATUS_MAP[newStatus]?.text || newStatus;
    if (!window.confirm(`Xác nhận chuyển đơn #${id} sang "${statusText}"?`)) return;

    try {
      await api.put(`/bookings/${id}/status`, { status: newStatus });
      toast.success(`Đã cập nhật: ${statusText}`);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    }
  };

  // Xác nhận đã thu tiền
  const handleConfirmPayment = async (id) => {
    const booking = bookings.find(b => b.id === id);
    const method = PAYMENT_METHOD_MAP[booking?.paymentMethod] || '💵 Tiền mặt';

    if (!window.confirm(`Xác nhận khách đã thanh toán đơn #${id}?\nPhương thức: ${method}`)) return;

    try {
      await api.put(`/bookings/${id}/pay`, {
        paymentMethod: booking?.paymentMethod || 'CASH'
      });
      toast.success('💰 Đã xác nhận thanh toán!');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xác nhận thất bại');
    }
  };

  // 🆕 XÓA ĐƠN VĨNH VIỄN
  const handleDelete = async (id) => {
    if (!window.confirm(`⚠️ XÓA VĨNH VIỄN đơn #${id}?\nHành động KHÔNG THỂ HOÀN TÁC!`)) return;

    try {
      await api.delete(`/bookings/${id}/permanent`);
      toast.success('🗑️ Đã xóa đơn vĩnh viễn');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const toServiceArray = (services) => {
    if (Array.isArray(services)) return services;
    if (typeof services === 'string') {
      try {
        const parsed = JSON.parse(services);
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    }
    return [];
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatDateTime = (d) => {
    const date = new Date(d);
    return date.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const tabs = [
    { key: 'ALL', label: `📋 Tất cả (${bookings.length})` },
    { key: 'PENDING', label: `⏳ Chờ (${bookings.filter(b => b.status === 'PENDING').length})` },
    { key: 'CONFIRMED', label: `✅ Xác nhận (${bookings.filter(b => b.status === 'CONFIRMED').length})` },
    { key: 'CHECKED_IN', label: `🏨 Đang ở (${bookings.filter(b => b.status === 'CHECKED_IN').length})` },
    { key: 'CHECKED_OUT', label: `👋 Trả phòng (${bookings.filter(b => b.status === 'CHECKED_OUT').length})` }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/staff" className="text-primary hover:underline mb-4 inline-block">
        ← Về trang Lễ tân
      </Link>

      <h1 className="text-3xl font-bold text-dark mb-6">📋 Quản lý đơn đặt phòng</h1>

      {/* Tabs lọc */}
      <div className="flex gap-2 mb-6 border-b-2 border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setFilter(tab.key);
              setSearchParams(tab.key === 'ALL' ? {} : { filter: tab.key });
            }}
            className={`px-4 py-3 font-semibold transition border-b-4 -mb-0.5 whitespace-nowrap ${
              filter === tab.key
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-yellow-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-16 text-gray-500">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-16 text-gray-500">Không có đơn nào</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => {
            const st = STATUS_MAP[b.status] || STATUS_MAP.PENDING;
            const isExpanded = expandedId === b.id;
            const serviceList = toServiceArray(b.services);
            const nights = Math.ceil(
              (new Date(b.checkOutDate) - new Date(b.checkInDate)) / (1000 * 60 * 60 * 24)
            );
            const isPaid = b.paymentStatus === 'PAID';

            return (
              <div key={b.id} className="bg-white rounded-xl shadow-md border-2 border-gray-100 overflow-hidden">
                {/* ==== HEADER ĐƠN ==== */}
                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-b">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 text-white font-bold w-12 h-12 rounded-full flex items-center justify-center">
                      #{b.id}
                    </div>
                    <div>
                      <p className="font-bold text-dark">Phòng {b.room?.roomNumber} - {b.room?.type}</p>
                      <p className="text-xs text-gray-500">
                        Khách: <span className="font-semibold">{b.guestName || 'Chưa có'}</span>
                        {' • '}SĐT: {b.guestPhone || 'Chưa có'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${st.color}`}>
                      {st.text}
                    </span>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      isPaid
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-red-100 text-red-700 border-red-300'
                    }`}>
                      {isPaid ? '💰 Đã TT' : '💸 Chưa TT'}
                    </span>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : b.id)}
                      className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-semibold transition"
                    >
                      {isExpanded ? '▲ Thu gọn' : '▼ Xem đầy đủ'}
                    </button>
                  </div>
                </div>

                {/* ==== TÓM TẮT NHANH ==== */}
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">📅 Nhận phòng</p>
                    <p className="font-semibold">{formatDate(b.checkInDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">📅 Trả phòng</p>
                    <p className="font-semibold">{formatDate(b.checkOutDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">🌙 Số đêm</p>
                    <p className="font-semibold">{nights} đêm</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">💰 Tổng tiền</p>
                    <p className="font-semibold text-secondary">{formatPrice(b.totalPrice)}</p>
                  </div>
                </div>

                {/* ==== CHI TIẾT ĐẦY ĐỦ ==== */}
                {isExpanded && (
                  <div className="border-t-2 border-dashed border-gray-300 bg-gray-50 p-6 space-y-4">
                    <div className="bg-white rounded-lg border-2 border-blue-200 overflow-hidden">
                      <div className="bg-blue-50 px-4 py-2 font-bold text-blue-800">
                        👤 THÔNG TIN KHÁCH HÀNG
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <p><span className="text-gray-500">Họ tên: </span><span className="font-semibold">{b.guestName || '—'}</span></p>
                        <p><span className="text-gray-500">SĐT: </span><span className="font-semibold">{b.guestPhone || '—'}</span></p>
                        <p><span className="text-gray-500">Email: </span><span className="font-semibold">{b.guestEmail || '—'}</span></p>
                        <p><span className="text-gray-500">CMND/CCCD: </span><span className="font-semibold">{b.guestIdCard || '—'}</span></p>
                      </div>
                    </div>

                    {b.user && b.user.name !== b.guestName && (
                      <div className="bg-white rounded-lg border-2 border-purple-200 overflow-hidden">
                        <div className="bg-purple-50 px-4 py-2 font-bold text-purple-800">
                          📝 NGƯỜI ĐẶT PHÒNG
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <p><span className="text-gray-500">Họ tên: </span><span className="font-semibold">{b.user.name}</span></p>
                          <p><span className="text-gray-500">Email: </span><span className="font-semibold">{b.user.email || '—'}</span></p>
                          <p><span className="text-gray-500">SĐT: </span><span className="font-semibold">{b.user.phone || '—'}</span></p>
                        </div>
                      </div>
                    )}

                    <div className="bg-white rounded-lg border-2 border-indigo-200 overflow-hidden">
                      <div className="bg-indigo-50 px-4 py-2 font-bold text-indigo-800">
                        👥 SỐ NGƯỜI
                      </div>
                      <div className="p-4 flex flex-wrap gap-4 text-sm">
                        <p>👤 Người lớn: <span className="font-semibold text-blue-700">{b.adults || 1}</span></p>
                        <p>👶 Trẻ &lt; 6 tuổi: <span className="font-semibold text-green-600">{b.childrenUnder6 || 0}</span></p>
                        <p>🧒 Trẻ 6-12 tuổi: <span className="font-semibold text-orange-600">{b.children6to12 || 0}</span></p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border-2 border-green-200 overflow-hidden">
                      <div className="bg-green-50 px-4 py-2 font-bold text-green-800">
                        💳 THANH TOÁN
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <p>
                          <span className="text-gray-500">Phương thức: </span>
                          <span className="font-semibold">
                            {PAYMENT_METHOD_MAP[b.paymentMethod] || b.paymentMethod || '💵 Tiền mặt'}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Trạng thái: </span>
                          <span className={`font-semibold ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                            {isPaid ? '✅ Đã thanh toán' : '⏳ Chưa thanh toán'}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Tổng tiền: </span>
                          <span className="font-bold text-secondary">{formatPrice(b.totalPrice)}</span>
                        </p>
                      </div>
                    </div>

                    {serviceList.length > 0 && (
                      <div className="bg-white rounded-lg border-2 border-yellow-200 overflow-hidden">
                        <div className="bg-yellow-50 px-4 py-2 font-bold text-yellow-800">
                          🎁 DỊCH VỤ ĐI KÈM ({serviceList.length})
                        </div>
                        <div className="p-4 flex flex-wrap gap-2">
                          {serviceList.map((svc, i) => (
                            <span key={i} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-300">
                              {svc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {b.specialRequests && (
                      <div className="bg-white rounded-lg border-2 border-orange-200 overflow-hidden">
                        <div className="bg-orange-50 px-4 py-2 font-bold text-orange-800">
                          📝 YÊU CẦU ĐẶC BIỆT
                        </div>
                        <div className="p-4 text-sm italic text-gray-700">
                          {b.specialRequests}
                        </div>
                      </div>
                    )}

                    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 font-bold text-gray-800">
                        🕐 THÔNG TIN ĐƠN
                      </div>
                      <div className="p-4 text-sm">
                        <p><span className="text-gray-500">Ngày tạo đơn: </span><span className="font-semibold">{formatDateTime(b.createdAt)}</span></p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==== NÚT HÀNH ĐỘNG ==== */}
                <div className="bg-gray-50 px-4 py-3 flex gap-2 flex-wrap border-t">
                  {/* Xác nhận thanh toán — chỉ hiện khi chưa TT */}
                  {!isPaid && b.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleConfirmPayment(b.id)}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-semibold"
                    >
                      💰 Xác nhận đã thu tiền
                    </button>
                  )}

                  {/* Xác nhận đơn */}
                  {b.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
                    >
                      ✅ Xác nhận đơn
                    </button>
                  )}

                  {/* Check-in */}
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'CHECKED_IN')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold"
                    >
                      🏨 Check-in (Nhận phòng)
                    </button>
                  )}

                  {/* Check-out */}
                  {b.status === 'CHECKED_IN' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'CHECKED_OUT')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-semibold"
                    >
                      👋 Check-out (Trả phòng)
                    </button>
                  )}

                  {/* Hủy đơn */}
                  {['PENDING', 'CONFIRMED'].includes(b.status) && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'CANCELLED')}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-semibold"
                    >
                      ❌ Hủy đơn
                    </button>
                  )}

                  {/* 🆕 XÓA VĨNH VIỄN — chỉ hiện khi đơn CANCELLED hoặc CHECKED_OUT */}
                  {['CANCELLED', 'CHECKED_OUT'].includes(b.status) && (
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-semibold"
                    >
                      🗑️ Xóa vĩnh viễn
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}