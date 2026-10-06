import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLogin() {
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
        expectedRole: 'ADMIN'
      });
      login(data.data);
      toast.success('👑 Đăng nhập Admin thành công!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-300 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-purple-600 to-purple-800 text-white px-6 py-6 text-center">
          <div className="text-5xl mb-2">👑</div>
          <h2 className="text-2xl font-bold">Đăng nhập Admin</h2>
          <p className="text-purple-100 text-sm mt-1">Dành cho quản trị viên hệ thống</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">📧 Email Admin</label>
              <input
                type="email"
                className="input-field"
                placeholder="VD: admin@tvpp.com"
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
                placeholder="Nhập mật khẩu admin"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white w-full py-3 rounded-lg font-bold transition"
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý...' : '🔐 Đăng nhập Admin'}
            </button>
          </form>

          {/* Cảnh báo bảo mật */}
          <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded text-sm text-red-800">
            🔐 <strong>Cổng bảo mật cao</strong> — Chỉ Admin mới truy cập được.
          </div>

          {/* Chuyển sang cổng khác */}
          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200">
            <p className="text-center text-gray-500 text-xs mb-3">Bạn là khách hàng hoặc nhân viên?</p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                className="text-center bg-blue-50 border border-blue-300 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
              >
                👤 Khách hàng
              </Link>
              <Link
                to="/staff/login"
                className="text-center bg-yellow-50 border border-yellow-300 text-yellow-700 py-2 rounded-lg hover:bg-yellow-100 transition text-sm font-medium"
              >
                🛎️ Nhân viên
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}