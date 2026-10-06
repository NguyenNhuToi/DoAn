import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải từ 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
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
      {/* Nút quay lại */}
      <Link
        to="/profile"
        className="text-primary hover:underline mb-4 inline-block"
      >
        ← Quay lại trang cá nhân
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-dark text-center">🔒 Đổi mật khẩu</h1>

      <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 overflow-hidden">
        <div className="bg-linear-to-r from-red-500 to-red-700 text-white px-6 py-4">
          <h2 className="font-bold text-xl">🔐 Bảo mật tài khoản</h2>
          <p className="text-red-100 text-sm mt-1">
            Để bảo mật, vui lòng nhập mật khẩu cũ trước khi đổi mật khẩu mới
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-sm">
                🔑 Mật khẩu cũ <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Nhập mật khẩu hiện tại"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm">
                🆕 Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Ít nhất 6 ký tự"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm">
                ✅ Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Nhập lại mật khẩu mới"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>

            {passwordForm.newPassword && passwordForm.confirmPassword &&
             passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                ⚠️ Mật khẩu xác nhận không khớp
              </p>
            )}

            {passwordForm.newPassword && passwordForm.newPassword.length < 6 && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                ⚠️ Mật khẩu phải từ 6 ký tự trở lên
              </p>
            )}

            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white w-full py-3 rounded-lg font-bold text-lg transition shadow-md"
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý...' : '🔒 Đổi mật khẩu'}
            </button>
          </form>

          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded mt-6">
            <p className="text-sm text-yellow-800 font-bold mb-2">💡 Lưu ý bảo mật:</p>
            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
              <li>Mật khẩu phải từ 6 ký tự trở lên</li>
              <li>Nên dùng kết hợp chữ, số và ký tự đặc biệt</li>
              <li>Không chia sẻ mật khẩu với người khác</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}