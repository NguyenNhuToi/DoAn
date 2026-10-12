import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// 🆕 Hàm kiểm tra mật khẩu mạnh
const validatePassword = (password) => {
  const errors = [];
  if (password.length < 6) errors.push('Ít nhất 6 ký tự');
  if (!/[A-Z]/.test(password)) errors.push('Ít nhất 1 chữ VIẾT HOA');
  if (!/[0-9]/.test(password)) errors.push('Ít nhất 1 chữ số');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Ít nhất 1 ký tự đặc biệt (!@#$%^&*...)');
  }
  return errors;
};

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', address: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // 🆕 Tính độ mạnh realtime
  const passwordErrors = validatePassword(form.password);
  const isPasswordValid = form.password.length > 0 && passwordErrors.length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🆕 Kiểm tra mật khẩu trước khi gửi
    if (!isPasswordValid) {
      toast.error('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra lại.');
      return;
    }

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
            {/* Họ tên */}
            <div>
              <label className="block mb-1 font-medium text-sm">👤 Họ tên</label>
              <input
                type="text"
                className="input-field"
                placeholder="VD: Nguyễn Văn A"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1 font-medium text-sm">📧 Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="VD: khach@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {/* 🆕 Mật khẩu — có nút hiện/ẩn */}
            <div>
              <label className="block mb-1 font-medium text-sm">🔒 Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field pr-12 ${
                    form.password && !isPasswordValid ? 'border-red-400' : ''
                  } ${isPasswordValid ? 'border-green-400' : ''}`}
                  placeholder="VD: Matkhau@123"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* 🆕 Yêu cầu mật khẩu */}
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-blue-800 mb-1">
                  Mật khẩu phải có:
                </p>
                <Requirement
                  met={form.password.length >= 6}
                  text="Ít nhất 6 ký tự"
                />
                <Requirement
                  met={/[A-Z]/.test(form.password)}
                  text="Ít nhất 1 chữ VIẾT HOA (A-Z)"
                />
                <Requirement
                  met={/[0-9]/.test(form.password)}
                  text="Ít nhất 1 chữ số (0-9)"
                />
                <Requirement
                  met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)}
                  text="Ít nhất 1 ký tự đặc biệt (!@#$%^&*...)"
                />
              </div>
            </div>

            {/* SĐT */}
            <div>
              <label className="block mb-1 font-medium text-sm">📞 Số điện thoại</label>
              <input
                type="text"
                className="input-field"
                placeholder="VD: 0987654321"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block mb-1 font-medium text-sm">📍 Địa chỉ</label>
              <input
                type="text"
                className="input-field"
                placeholder="VD: 123 Nguyễn Du, Hà Nội"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3"
              disabled={loading || !isPasswordValid}
            >
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

          {/* Link nhân viên/admin */}
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

// 🆕 Component hiển thị yêu cầu mật khẩu
function Requirement({ met, text }) {
  return (
    <p className={`flex items-center gap-2 ${met ? 'text-green-600' : 'text-gray-500'}`}>
      <span>{met ? '✅' : '⭕'}</span>
      <span className={met ? 'font-medium' : ''}>{text}</span>
    </p>
  );
}