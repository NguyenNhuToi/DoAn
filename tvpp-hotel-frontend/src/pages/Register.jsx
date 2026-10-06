import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', address: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.data);
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white px-6 py-6 text-center">
          <div className="text-5xl mb-2">👤</div>
          <h2 className="text-2xl font-bold">Đăng ký Khách hàng</h2>
          <p className="text-blue-100 text-sm mt-1">Tạo tài khoản để đặt phòng trực tuyến</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: '👤 Họ tên', type: 'text', placeholder: 'VD: Nguyễn Văn A', required: true },
              { key: 'email', label: '📧 Email', type: 'email', placeholder: 'VD: khach@email.com', required: true },
              { key: 'password', label: '🔒 Mật khẩu', type: 'password', placeholder: 'Ít nhất 6 ký tự', required: true },
              { key: 'phone', label: '📞 Số điện thoại', type: 'text', placeholder: 'VD: 0987654321', required: false },
              { key: 'address', label: '📍 Địa chỉ', type: 'text', placeholder: 'VD: 123 Nguyễn Du, Hà Nội', required: false }
            ].map((field) => (
              <div key={field.key}>
                <label className="block mb-1 font-medium text-sm">{field.label}</label>
                <input
                  type={field.type}
                  className="input-field"
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  required={field.required}
                  minLength={field.key === 'password' ? 6 : undefined}
                />
              </div>
            ))}

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? '⏳ Đang xử lý...' : '✅ Đăng ký'}
            </button>
          </form>

          {/* Đã có tài khoản */}
          <p className="text-center mt-4 text-gray-600 text-sm">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Đăng nhập
            </Link>
          </p>

          {/* 🆕 Link cho nhân viên/admin */}
          <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200">
            <p className="text-center text-gray-500 text-xs mb-3">
              Bạn là nhân viên hoặc admin?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/staff/login"
                className="text-center bg-yellow-50 border border-yellow-300 text-yellow-700 py-2 rounded-lg hover:bg-yellow-100 transition text-sm font-medium"
              >
                🛎️ Nhân viên
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