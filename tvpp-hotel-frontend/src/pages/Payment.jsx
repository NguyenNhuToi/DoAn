import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'CASH', name: 'Tiền mặt', icon: '💵', desc: 'Thanh toán tại khách sạn' },
  { id: 'VNPAY', name: 'VNPay', icon: '🏦', desc: 'Cổng thanh toán VNPay' },
  { id: 'MOMO', name: 'MoMo', icon: '📱', desc: 'Ví điện tử MoMo' },
  { id: 'BANK', name: 'Chuyển khoản', icon: '🏛️', desc: 'Chuyển khoản ngân hàng' }
];

export default function Payment() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    api.get(`/bookings/${id}/invoice`)
      .then(({ data }) => {
        setBooking(data.data.booking);
        setInvoice(data.data.invoice);
        setPaymentMethod(data.data.booking.paymentMethod || 'CASH');
      })
      .catch(() => {
        toast.error('Không tải được hóa đơn');
        navigate('/my-bookings');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const formatPrice = (p) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const handlePayment = async () => {
    const method = PAYMENT_METHODS.find(m => m.id === paymentMethod);
    if (!window.confirm(`Xác nhận thanh toán ${formatPrice(invoice.totalPrice)} bằng ${method?.name}?`)) return;

    setProcessing(true);

    setTimeout(async () => {
      try {
        await api.put(`/bookings/${id}/pay`, { paymentMethod });
        toast.success('🎉 Thanh toán thành công!');
        navigate('/my-bookings');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Thanh toán thất bại');
      } finally {
        setProcessing(false);
      }
    }, 1500);
  };

  if (loading) return <p className="text-center py-16 text-gray-500">Đang tải hóa đơn...</p>;
  if (!invoice || !booking) return null;

  const isPaid = invoice.paymentStatus === 'PAID';
  const serviceList = toServiceArray(booking.services);

  return (
    <div className="mx-auto px-4 py-8 max-w-3xl">
      <Link to="/my-bookings" className="text-primary hover:underline mb-4 inline-block">
        ← Quay lại đơn của tôi
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-dark">💳 Thanh toán hóa đơn</h1>

      {isPaid && (
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6 text-center">
          <p className="text-green-700 font-bold text-lg">✅ Hóa đơn đã được thanh toán</p>
          <p className="text-green-600 text-sm">
            Phương thức: {PAYMENT_METHODS.find(m => m.id === invoice.paymentMethod)?.name || invoice.paymentMethod}
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 overflow-hidden mb-6">
        <div className="bg-blue-700 text-white px-6 py-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold">HÓA ĐƠN ĐẶT PHÒNG</h2>
              <p className="text-blue-200 text-sm">Mã đơn: #{booking.id}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-sm">Ngày tạo</p>
              <p className="font-semibold">{formatDate(booking.createdAt)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-b">
          <h3 className="font-bold text-dark mb-3">👤 Thông tin khách hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <p><span className="text-gray-500">Họ tên: </span><span className="font-semibold">{booking.user?.name}</span></p>
            <p><span className="text-gray-500">Email: </span><span className="font-semibold">{booking.user?.email}</span></p>
            <p><span className="text-gray-500">SĐT: </span><span className="font-semibold">{booking.user?.phone}</span></p>
          </div>
        </div>

        <div className="p-6 border-b">
          <h3 className="font-bold text-dark mb-3">🏨 Thông tin phòng</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <img
              src={booking.room?.image}
              alt={booking.room?.type}
              className="w-full sm:w-32 h-32 sm:h-24 object-cover rounded-lg"
            />
            <div>
              <p className="font-bold">Phòng {booking.room?.roomNumber} - {booking.room?.type}</p>
              <p className="text-gray-600 text-sm mt-1">📅 Nhận: {formatDate(booking.checkInDate)}</p>
              <p className="text-gray-600 text-sm">📅 Trả: {formatDate(booking.checkOutDate)}</p>
              <p className="text-gray-600 text-sm">👥 Sức chứa phòng: {booking.room?.capacity} người</p>
              <p className="text-gray-600 text-sm">👤 {booking.adults} người lớn, {booking.children} trẻ em</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-bold text-dark mb-3">💰 Chi tiết thanh toán</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Tiền phòng ({invoice.nights} đêm × {formatPrice(booking.room?.price)})
              </span>
              <span className="font-semibold">{formatPrice(invoice.roomPrice)}</span>
            </div>

            {invoice.extraAdultsFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-orange-600">
                  ⚠️ Phụ thu người lớn vượt sức chứa ({invoice.extraAdults} × 200.000đ × {invoice.nights} đêm)
                </span>
                <span className="font-semibold text-orange-600">{formatPrice(invoice.extraAdultsFee)}</span>
              </div>
            )}

            {invoice.extraChildrenFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-orange-600">
                  ⚠️ Phụ thu trẻ em 6-12 tuổi ({invoice.childrenCount} × 100.000đ × {invoice.nights} đêm)
                </span>
                <span className="font-semibold text-orange-600">{formatPrice(invoice.extraChildrenFee)}</span>
              </div>
            )}

            {invoice.servicesPrice > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Dịch vụ đi kèm ({serviceList.length} dịch vụ)
                </span>
                <span className="font-semibold">{formatPrice(invoice.servicesPrice)}</span>
              </div>
            )}

            {serviceList.length > 0 && (
              <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded mt-2">
                <p className="text-xs font-bold text-green-800 mb-1">Dịch vụ đã chọn:</p>
                <div className="flex flex-wrap gap-1">
                  {serviceList.map((svc, i) => (
                    <span key={i} className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t-2 border-dashed pt-3 mt-3 flex justify-between text-xl font-bold">
              <span>TỔNG CỘNG</span>
              <span className="text-secondary">{formatPrice(invoice.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {!isPaid && (
        <>
          <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6 mb-6">
            <h3 className="font-bold text-dark mb-4">💳 Chọn phương thức thanh toán</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border-2 transition ${
                    paymentMethod === method.id
                      ? 'bg-blue-50 border-blue-500 shadow-md'
                      : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="hidden"
                  />
                  <span className="text-3xl">{method.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-dark">{method.name}</p>
                    <p className="text-xs text-gray-500">{method.desc}</p>
                  </div>
                  {paymentMethod === method.id && (
                    <span className="text-blue-600 text-xl">✓</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={processing}
            className={`w-full py-4 rounded-xl font-bold text-lg transition shadow-lg ${
              processing
                ? 'bg-gray-400 text-white cursor-wait'
                : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900'
            }`}
          >
            {processing ? '⏳ Đang xử lý...' : `💳 Thanh toán ${formatPrice(invoice.totalPrice)}`}
          </button>
        </>
      )}

      {isPaid && (
        <div className="text-center">
          <Link to="/my-bookings" className="btn-primary inline-block">
            ← Về trang đơn của tôi
          </Link>
        </div>
      )}
    </div>
  );
}