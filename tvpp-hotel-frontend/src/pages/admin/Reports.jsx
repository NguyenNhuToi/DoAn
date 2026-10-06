import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/bookings')
        ]);
        setStats(statsRes.data.data);
        setBookings(bookingsRes.data.data);
      } catch (err) {
        toast.error('Không tải được báo cáo');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPrice = (p) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (loading) return <p className="text-center py-16 text-gray-500">Đang tải báo cáo...</p>;

  // Thống kê theo trạng thái
  const statusCounts = {
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
    CHECKED_IN: bookings.filter(b => b.status === 'CHECKED_IN').length,
    CHECKED_OUT: bookings.filter(b => b.status === 'CHECKED_OUT').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length
  };

  // Doanh thu đã thu
  const paidBookings = bookings.filter(b => b.paymentStatus === 'PAID');
  const totalRevenue = paidBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

  // Doanh thu chưa thu
  const unpaidBookings = bookings.filter(b => b.paymentStatus !== 'PAID' && b.status !== 'CANCELLED');
  const pendingRevenue = unpaidBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

  // Top 5 phòng được đặt nhiều nhất
  const roomCounts = {};
  bookings.forEach(b => {
    const key = `Phòng ${b.room?.roomNumber} - ${b.room?.type}`;
    roomCounts[key] = (roomCounts[key] || 0) + 1;
  });
  const topRooms = Object.entries(roomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/admin" className="text-primary hover:underline mb-4 inline-block">
        ← Về trang quản trị
      </Link>

      <h1 className="text-3xl font-bold text-dark mb-6">📊 Báo cáo thống kê</h1>

      {/* Tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-linear-to-br from-blue-500 to-blue-700 text-white rounded-xl p-5">
          <div className="text-3xl mb-2">🛏️</div>
          <p className="text-sm opacity-90">Tổng số phòng</p>
          <p className="text-3xl font-bold">{stats?.totalRooms || 0}</p>
        </div>
        <div className="bg-linear-to-br from-green-500 to-green-700 text-white rounded-xl p-5">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-sm opacity-90">Khách hàng</p>
          <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-linear-to-br from-yellow-500 to-orange-600 text-white rounded-xl p-5">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm opacity-90">Tổng đơn đặt</p>
          <p className="text-3xl font-bold">{bookings.length}</p>
        </div>
        <div className="bg-linear-to-br from-purple-500 to-purple-700 text-white rounded-xl p-5">
          <div className="text-3xl mb-2">💰</div>
          <p className="text-sm opacity-90">Doanh thu đã thu</p>
          <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Doanh thu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md border-2 border-green-200 p-6">
          <h3 className="text-lg font-bold text-green-800 mb-3">✅ Doanh thu đã thu</h3>
          <p className="text-3xl font-bold text-green-600 mb-2">{formatPrice(totalRevenue)}</p>
          <p className="text-sm text-gray-500">{paidBookings.length} đơn đã thanh toán</p>
        </div>
        <div className="bg-white rounded-xl shadow-md border-2 border-red-200 p-6">
          <h3 className="text-lg font-bold text-red-800 mb-3">⏳ Doanh thu chưa thu</h3>
          <p className="text-3xl font-bold text-red-600 mb-2">{formatPrice(pendingRevenue)}</p>
          <p className="text-sm text-gray-500">{unpaidBookings.length} đơn chưa thanh toán</p>
        </div>
      </div>

      {/* Thống kê trạng thái */}
      <div className="bg-white rounded-xl shadow-md border-2 border-blue-200 p-6 mb-8">
        <h3 className="text-xl font-bold text-dark mb-4">📈 Đơn đặt theo trạng thái</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { key: 'PENDING', label: '⏳ Chờ', color: 'bg-yellow-100 text-yellow-700' },
            { key: 'CONFIRMED', label: '✅ Xác nhận', color: 'bg-blue-100 text-blue-700' },
            { key: 'CHECKED_IN', label: '🏨 Đang ở', color: 'bg-green-100 text-green-700' },
            { key: 'CHECKED_OUT', label: '👋 Trả phòng', color: 'bg-gray-100 text-gray-700' },
            { key: 'CANCELLED', label: '❌ Hủy', color: 'bg-red-100 text-red-700' }
          ].map(item => (
            <div key={item.key} className={`rounded-lg p-4 text-center ${item.color}`}>
              <p className="text-xs font-semibold mb-1">{item.label}</p>
              <p className="text-2xl font-bold">{statusCounts[item.key]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top phòng */}
      <div className="bg-white rounded-xl shadow-md border-2 border-purple-200 p-6 mb-8">
        <h3 className="text-xl font-bold text-dark mb-4">🏆 Top 5 phòng được đặt nhiều nhất</h3>
        {topRooms.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Chưa có dữ liệu</p>
        ) : (
          <div className="space-y-3">
            {topRooms.map(([name, count], i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="bg-purple-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-dark">{name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(count / topRooms[0][1]) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-lg font-bold text-purple-600">{count} đơn</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Đơn gần đây */}
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b">
          <h3 className="text-xl font-bold text-dark">🕐 Đơn đặt gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Mã</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Khách</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Phòng</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Ngày</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Tiền</th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 10).map(b => (
                <tr key={b.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold">#{b.id}</td>
                  <td className="px-4 py-3">{b.guestName || 'Chưa có'}</td>
                  <td className="px-4 py-3">P.{b.room?.roomNumber}</td>
                  <td className="px-4 py-3">{formatDate(b.checkInDate)}</td>
                  <td className="px-4 py-3 font-bold text-secondary">{formatPrice(b.totalPrice)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      b.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {b.paymentStatus === 'PAID' ? 'Đã TT' : 'Chưa TT'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}