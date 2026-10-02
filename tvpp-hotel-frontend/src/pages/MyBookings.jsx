import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const { user } = useAuth();

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data.data);
    } catch {
      toast.error('Không thể tải đơn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn HỦY đơn này?')) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Đã hủy đơn');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hủy thất bại');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ XÓA VĨNH VIỄN đơn này?')) return;
    try {
      await api.delete(`/bookings/${id}/permanent`);
      toast.success('Đã xóa đơn');
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

  const statusMap = {
    PENDING: { text: '⏳ Chờ xác nhận', color: 'text-yellow-700' },
    CONFIRMED: { text: '✅ Đã xác nhận', color: 'text-blue-700' },
    CHECKED_IN: { text: '🏨 Đang ở', color: 'text-green-700' },
    CHECKED_OUT: { text: '👋 Đã trả phòng', color: 'text-gray-700' },
    CANCELLED: { text: '❌ Đã hủy', color: 'text-red-700' }
  };

  const paymentMethodMap = {
    CASH: '💵 Tiền mặt',
    VNPAY: '🏦 VNPay',
    MOMO: '📱 MoMo',
    BANK: '🏛️ Chuyển khoản'
  };

  const calcNights = (ci, co) => {
    const n = Math.ceil((new Date(co) - new Date(ci)) / (1000 * 60 * 60 * 24));
    return n > 0 ? n : 1;
  };

  const unpaidBookings = bookings.filter(b => b.paymentStatus !== 'PAID');
  const paidBookings = bookings.filter(b => b.paymentStatus === 'PAID');

  const displayedBookings =
    activeTab === 'UNPAID' ? unpaidBookings :
    activeTab === 'PAID' ? paidBookings :
    bookings;

  if (loading) return <p className="text-center py-16 text-gray-500">Đang tải...</p>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-dark">📋 Đơn đặt phòng của tôi</h1>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-5 py-3 font-semibold transition border-b-4 -mb-0.5 ${
            activeTab === 'ALL' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'
          }`}
        >
          📋 Tất cả ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('UNPAID')}
          className={`px-5 py-3 font-semibold transition border-b-4 -mb-0.5 ${
            activeTab === 'UNPAID' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-yellow-600'
          }`}
        >
          ⏳ Chưa thanh toán ({unpaidBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('PAID')}
          className={`px-5 py-3 font-semibold transition border-b-4 -mb-0.5 ${
            activeTab === 'PAID' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-green-600'
          }`}
        >
          ✅ Đã thanh toán ({paidBookings.length})
        </button>
      </div>

      {displayedBookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">Chưa có đơn nào</p>
          {activeTab === 'ALL' && <Link to="/rooms" className="btn-primary">Đặt phòng ngay</Link>}
        </div>
      ) : (
        <div className="space-y-8">
          {displayedBookings.map((b) => {
            const st = statusMap[b.status] || statusMap.PENDING;
            const nights = calcNights(b.checkInDate, b.checkOutDate);
            const isPaid = b.paymentStatus === 'PAID';
            const canCancel = !isPaid && (b.status === 'PENDING' || b.status === 'CONFIRMED');
            const canDelete = b.status === 'CANCELLED' || b.status === 'CHECKED_OUT' || (isPaid && b.status === 'CONFIRMED');
            const canPay = !isPaid && b.status !== 'CANCELLED';
            const serviceList = toServiceArray(b.services);

            return (
              <div key={b.id} className={`bg-white rounded-2xl overflow-hidden shadow-lg border-2 ${isPaid ? 'border-green-300' : 'border-yellow-300'}`}>
                <div className={`text-white px-6 py-4 flex justify-between items-center ${isPaid ? 'bg-green-700' : 'bg-blue-700'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`font-bold text-lg w-12 h-12 rounded-full flex items-center justify-center ${isPaid ? 'bg-white text-green-700' : 'bg-white text-blue-700'}`}>
                      #{b.id}
                    </div>
                    <div>
                      <p className="font-bold text-lg">Phòng {b.room?.roomNumber} - {b.room?.type}</p>
                      <p className={`text-sm ${isPaid ? 'text-green-200' : 'text-blue-200'}`}>Mã đơn: #{b.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPaid && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-green-700 shadow-md">
                        ✅ Đã TT
                      </span>
                    )}
                    <span className={`px-4 py-2 rounded-full text-sm font-bold bg-white shadow-md whitespace-nowrap ${st.color}`}>
                      {st.text}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="md:w-56 shrink-0 w-full">
                      <img
                        src={b.room?.image || 'https://via.placeholder.com/300x200'}
                        alt={b.room?.type}
                        className="w-full h-44 object-cover rounded-xl shadow-md border border-gray-200"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* THÔNG TIN KHÁCH HÀNG */}
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
                        <p className="text-sm font-bold text-blue-800 mb-2">👤 THÔNG TIN KHÁCH HÀNG</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <p className="truncate"><span className="text-gray-600">Họ tên: </span><span className="font-semibold">{b.guestName || 'Chưa có'}</span></p>
                          <p className="truncate"><span className="text-gray-600">Email: </span><span className="font-semibold">{b.guestEmail || 'Chưa có'}</span></p>
                          <p><span className="text-gray-600">SĐT: </span><span className="font-semibold">{b.guestPhone || 'Chưa có'}</span></p>
                          {b.guestIdCard && (
                            <p className="truncate"><span className="text-gray-600">CMND: </span><span className="font-semibold">{b.guestIdCard}</span></p>
                          )}
                        </div>
                      </div>

                      {/* 🆕 SỐ NGƯỜI — 2 LOẠI TRẺ EM */}
                      <div className="flex flex-wrap gap-4 text-sm mb-3 bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded">
                        <p>👤 Người lớn: <span className="font-semibold text-blue-700">{b.adults || 1}</span></p>
                        <p>👶 Trẻ &lt;6t: <span className="font-semibold text-green-600">{b.childrenUnder6 || 0}</span></p>
                        <p>🧒 Trẻ 6-12t: <span className="font-semibold text-orange-600">{b.children6to12 || 0}</span></p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-500 mb-1">📅 Nhận phòng</p>
                          <p className="font-bold text-dark text-sm">{formatDate(b.checkInDate)}</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-500 mb-1">📅 Trả phòng</p>
                          <p className="font-bold text-dark text-sm">{formatDate(b.checkOutDate)}</p>
                        </div>
                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center">
                          <p className="text-xs text-gray-500 mb-1">🌙 Số đêm</p>
                          <p className="font-bold text-dark text-sm">{nights} đêm</p>
                        </div>
                        <div className={`border p-3 rounded-lg text-center ${isPaid ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                          <p className="text-xs text-gray-500 mb-1">💳 Thanh toán</p>
                          <p className={`font-bold text-sm ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                            {isPaid ? 'Đã TT' : 'Chưa TT'}
                          </p>
                        </div>
                      </div>

                      {serviceList.length > 0 && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mb-4">
                          <p className="text-sm font-bold text-green-800 mb-2">🎁 DỊCH VỤ ĐI KÈM</p>
                          <div className="flex flex-wrap gap-2">
                            {serviceList.map((svc, i) => (
                              <span key={i} className="bg-green-600 text-white px-3 py-1 rounded-full text-xs">{svc}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {b.specialRequests && (
                        <p className="text-sm text-gray-700 italic bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-4">
                          📝 Yêu cầu: {b.specialRequests}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-5 border-t-2 border-dashed border-gray-300 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-gray-500 text-sm">Tổng tiền đơn #{b.id}:</span>
                      <span className="text-3xl font-bold text-secondary">{formatPrice(b.totalPrice)}</span>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                      >
                        👁️ Xem chi tiết
                      </button>

                      {canPay && (
                        <Link to={`/payment/${b.id}`} className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition text-sm font-semibold">
                          💳 Thanh toán
                        </Link>
                      )}

                      {isPaid && b.status !== 'CANCELLED' && (
                        <Link to={`/payment/${b.id}`} className="bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition text-sm font-semibold">
                          🖨️ Hóa đơn
                        </Link>
                      )}

                      {canCancel && (
                        <button onClick={() => handleCancel(b.id)} className="bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600 transition text-sm font-semibold">
                          ⏸️ Hủy đơn
                        </button>
                      )}

                      {canDelete && (
                        <button onClick={() => handleDelete(b.id)} className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition text-sm font-semibold">
                          🗑️ Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-white text-blue-700 font-bold text-lg w-12 h-12 rounded-full flex items-center justify-center">
                  #{selectedBooking.id}
                </div>
                <div>
                  <h2 className="font-bold text-xl">Chi tiết đơn</h2>
                  <p className="text-sm text-blue-200">Mã đơn: #{selectedBooking.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-white text-2xl hover:bg-blue-800 w-10 h-10 rounded-full transition">✕</button>
            </div>

            <div className="p-6 space-y-5">
              <div className="text-center">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold bg-gray-100 ${(statusMap[selectedBooking.status] || statusMap.PENDING).color}`}>
                  {(statusMap[selectedBooking.status] || statusMap.PENDING).text}
                </span>
              </div>

              <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 font-bold text-blue-800">🏨 THÔNG TIN PHÒNG</div>
                <div className="p-4 flex flex-col sm:flex-row gap-4">
                  <img src={selectedBooking.room?.image} alt={selectedBooking.room?.type} className="w-full sm:w-32 h-32 sm:h-24 object-cover rounded-lg" />
                  <div>
                    <p className="font-bold text-lg">Phòng {selectedBooking.room?.roomNumber} - {selectedBooking.room?.type}</p>
                    <p className="text-secondary font-bold">{formatPrice(selectedBooking.room?.price)}/đêm</p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 font-bold text-blue-800">👤 THÔNG TIN KHÁCH HÀNG</div>
                <div className="p-4 space-y-2 text-sm">
                  <p><span className="text-gray-500">Họ tên: </span><span className="font-semibold">{selectedBooking.guestName || 'Chưa có'}</span></p>
                  <p><span className="text-gray-500">SĐT: </span><span className="font-semibold">{selectedBooking.guestPhone || 'Chưa có'}</span></p>
                  <p><span className="text-gray-500">Email: </span><span className="font-semibold">{selectedBooking.guestEmail || 'Chưa có'}</span></p>
                  <p><span className="text-gray-500">CMND/CCCD: </span><span className="font-semibold">{selectedBooking.guestIdCard || 'Chưa có'}</span></p>
                </div>
              </div>

              <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
                <div className="bg-blue-50 px-4 py-2 font-bold text-blue-800">📅 THÔNG TIN ĐẶT PHÒNG</div>
                <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-500">Ngày nhận</p><p className="font-semibold">{formatDate(selectedBooking.checkInDate)}</p></div>
                  <div><p className="text-gray-500">Ngày trả</p><p className="font-semibold">{formatDate(selectedBooking.checkOutDate)}</p></div>
                  <div><p className="text-gray-500">Số đêm</p><p className="font-semibold">{calcNights(selectedBooking.checkInDate, selectedBooking.checkOutDate)} đêm</p></div>
                  <div>
                    <p className="text-gray-500">Số người</p>
                    <p className="font-semibold">
                      {selectedBooking.adults || 1} NL, {selectedBooking.childrenUnder6 || 0} trẻ &lt;6t, {selectedBooking.children6to12 || 0} trẻ 6-12t
                    </p>
                  </div>
                  <div><p className="text-gray-500">Thanh toán</p><p className="font-semibold">{paymentMethodMap[selectedBooking.paymentMethod] || '💵 Tiền mặt'}</p></div>
                  <div><p className="text-gray-500">Trạng thái TT</p><p className={`font-semibold ${selectedBooking.paymentStatus === 'PAID' ? 'text-green-600' : 'text-red-600'}`}>{selectedBooking.paymentStatus === 'PAID' ? '✅ Đã TT' : '⏳ Chưa TT'}</p></div>
                </div>
              </div>

              {toServiceArray(selectedBooking.services).length > 0 && (
                <div className="border-2 border-green-200 rounded-xl overflow-hidden">
                  <div className="bg-green-50 px-4 py-2 font-bold text-green-800">🎁 DỊCH VỤ</div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {toServiceArray(selectedBooking.services).map((svc, i) => (
                      <span key={i} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">{svc}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.specialRequests && (
                <div className="border-2 border-yellow-200 rounded-xl overflow-hidden">
                  <div className="bg-yellow-50 px-4 py-2 font-bold text-yellow-800">📝 YÊU CẦU</div>
                  <div className="p-4 text-sm italic">{selectedBooking.specialRequests}</div>
                </div>
              )}

              <div className="bg-secondary/10 border-2 border-secondary rounded-xl p-4 text-center">
                <p className="text-gray-600 text-sm">Tổng tiền</p>
                <p className="text-4xl font-bold text-secondary mt-2">{formatPrice(selectedBooking.totalPrice)}</p>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end sticky bottom-0 bg-white">
              <button onClick={() => setSelectedBooking(null)} className="btn-primary">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}