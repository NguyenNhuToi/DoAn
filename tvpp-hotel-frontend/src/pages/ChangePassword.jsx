import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const validatePassword = (password) => {
  const errors = [];
  if (password.length < 6) errors.push('Ít nhất 6 ký tự');
  if (!/[A-Z]/.test(password)) errors.push('Ít nhất 1 chữ VIẾT HOA');
  if (!/[0-9]/.test(password)) errors.push('Ít nhất 1 chữ số');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Ít nhất 1 ký tự đặc biệt');
  }
  return errors;
};

export default function ChangePassword() {
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const navigate = useNavigate();

  const passwordErrors = validatePassword(form.newPassword);
  const isPasswordValid = form.newPassword.length > 0 && passwordErrors.length === 0;
  const passwordsMatch = form.newPassword === form.confirmPassword;

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Mật khẩu mới chưa đủ mạnh');
      return;
    }

    if (!passwordsMatch) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });
      toast.success('🎉 Đổi mật khẩu thành công!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto px-4 py-8 max-w-2xl">
      <Link to="/profile" className="text-primary hover:underline mb-4 inline-block">
        ← Quay lại trang cá nhân
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-dark text-center">🔒 Đổi mật khẩu</h1>

      <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden">
        <div className="bg-linear-to-r from-red-500 to-red-700 text-white px-6 py-4">
          <h2 className="font-bold text-xl">🔐 Bảo mật tài khoản</h2>
          <p className="text-red-100 text-sm mt-1">
            Nhập mật khẩu cũ và mật khẩu mới
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Mật khẩu cũ */}
            <div>
              <label className="block mb-1 font-medium text-sm">
                🔑 Mật khẩu cũ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showOld ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={form.oldPassword}
                  onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showOld ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="block mb-1 font-medium text-sm">
                🆕 Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  className={`input-field pr-12 ${
                    form.newPassword && !isPasswordValid ? 'border-red-400' : ''
                  } ${isPasswordValid ? 'border-green-400' : ''}`}
                  placeholder="VD: Matkhau@123"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Yêu cầu mật khẩu */}
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
                <p className="font-semibold text-blue-800 mb-1">Mật khẩu mới phải có:</p>
                <Requirement met={form.newPassword.length >= 6} text="Ít nhất 6 ký tự" />
                <Requirement met={/[A-Z]/.test(form.newPassword)} text="Ít nhất 1 chữ VIẾT HOA" />
                <Requirement met={/[0-9]/.test(form.newPassword)} text="Ít nhất 1 chữ số" />
                <Requirement
                  met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.newPassword)}
                  text="Ít nhất 1 ký tự đặc biệt"
                />
              </div>
            </div>

            {/* Xác nhận */}
            <div>
              <label className="block mb-1 font-medium text-sm">
                ✅ Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className={`input-field ${
                  form.confirmPassword && !passwordsMatch ? 'border-red-400' : ''
                } ${form.confirmPassword && passwordsMatch ? 'border-green-400' : ''}`}
                placeholder="Nhập lại mật khẩu mới"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
              {form.confirmPassword && !passwordsMatch && (
                <p className="text-sm text-red-600 mt-1">⚠️ Mật khẩu không khớp</p>
              )}
            </div>

            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white w-full py-3 rounded-lg font-bold transition"
              disabled={loading || !isPasswordValid || !passwordsMatch}
            >
              {loading ? '⏳ Đang xử lý...' : '🔒 Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Requirement({ met, text }) {
  return (
    <p className={`flex items-center gap-2 ${met ? 'text-green-600' : 'text-gray-500'}`}>
      <span>{met ? '✅' : '⭕'}</span>
      <span className={met ? 'font-medium' : ''}>{text}</span>
    </p>
  );
}