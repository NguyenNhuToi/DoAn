import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function StaffLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        ...form,
        expectedRole: 'RECEPTIONIST'
      });
      login(data.data);
      toast.success('🛎️ Đăng nhập Nhân viên thành công!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-300 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-yellow-500 to-yellow-700 text-white px-6 py-6 text-center">
          <div className="text-5xl mb-2">🛎️</div>
          <h2 className="text-2xl font-bold">Đăng nhập Nhân viên</h2>
          <p className="text-yellow-100 text-sm mt-1">Dành cho lễ tân khách sạn</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">📧 Email nhân viên</label>
              <input
                type="email"
                className="input-field"
                placeholder="VD: nhanvien@tvpp.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">🔒 Mật khẩu</label>
              <input
                type="password"
                className="input-field"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white w-full py-3 rounded-lg font-bold transition"
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý...' : '➡️ Đăng nhập'}
            </button>
          </form>

          {/* Thông báo */}
          <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded text-sm text-yellow-800">
            ⚠️ Chỉ tài khoản <strong>Nhân viên</strong> mới đăng nhập được ở cổng này.
          </div>

          {/* Chuyển sang cổng khác */}
          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200">
            <p className="text-center text-gray-500 text-xs mb-3">Bạn là khách hàng hoặc admin?</p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                className="text-center bg-blue-50 border border-blue-300 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
              >
                👤 Khách hàng
              </Link>
              <Link
                to="/admin/login"
                className="text-center bg-purple-50 border border-purple-300 text-purple-700 py-2 rounded-lg hover:bg-purple-100 transition text-sm font-medium"
              >
                👑 Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}