import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [resetData, setResetData] = useState(null);
  const [form, setForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Đọc thông tin reset từ localStorage
    const stored = localStorage.getItem('resetData');
    if (!stored) {
      toast.error('Vui lòng nhập email trước');
      navigate('/forgot-password');
      return;
    }
    setResetData(JSON.parse(stored));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error('Mật khẩu phải từ 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        resetToken: resetData.resetToken,
        newPassword: form.newPassword
      });

      toast.success('🎉 Đặt lại mật khẩu thành công!');

      // Xóa token tạm
      localStorage.removeItem('resetData');

      // Về trang đăng nhập
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  if (!resetData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-green-600 to-green-800 text-white px-6 py-6 text-center">
          <div className="text-5xl mb-3">🔐</div>
          <h2 className="text-2xl font-bold">Đặt lại mật khẩu</h2>
          <p className="text-green-100 text-sm mt-2">
            Tài khoản: <strong>{resetData.name}</strong>
          </p>
          <p className="text-green-100 text-xs">{resetData.email}</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-sm">
                🔑 Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Ít nhất 6 ký tự"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                required
                minLength={6}
                autoFocus
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm">
                ✅ Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Nhập lại mật khẩu mới"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>

            {form.newPassword && form.confirmPassword &&
             form.newPassword !== form.confirmPassword && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                ⚠️ Mật khẩu xác nhận không khớp
              </p>
            )}

            {form.newPassword && form.newPassword.length < 6 && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                ⚠️ Mật khẩu phải từ 6 ký tự trở lên
              </p>
            )}

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded-lg font-bold text-lg transition shadow-md"
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý...' : '🔐 Đặt lại mật khẩu'}
            </button>
          </form>

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