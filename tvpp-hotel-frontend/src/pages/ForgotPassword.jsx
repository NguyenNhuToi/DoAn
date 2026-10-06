import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });

      toast.success('✅ Xác thực email thành công!');

      // Lưu token + email vào localStorage để trang Reset dùng
      localStorage.setItem('resetData', JSON.stringify({
        resetToken: data.data.resetToken,
        email: data.data.email,
        name: data.data.name
      }));

      // Chuyển sang trang đặt lại mật khẩu
      navigate('/reset-password');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white px-6 py-6 text-center">
          <div className="text-5xl mb-3">🔑</div>
          <h2 className="text-2xl font-bold">Quên mật khẩu?</h2>
          <p className="text-blue-100 text-sm mt-2">
            Nhập email của bạn để đặt lại mật khẩu
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-sm">
                📧 Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="VD: khach@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3"
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý...' : '➡️ Tiếp tục'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
            <p className="text-sm text-blue-800">
              💡 <strong>Lưu ý:</strong> Nếu bạn không nhớ email đã đăng ký, vui lòng liên hệ bộ phận hỗ trợ.
            </p>
          </div>

          <div className="text-center mt-6 text-sm text-gray-600">
            <Link to="/login" className="text-primary hover:underline font-medium">
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}