import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // 🆕 Tab hiện tại
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'password'

  // 🆕 Form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 🆕 Form thông tin cá nhân
  const [infoForm, setInfoForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [loading, setLoading] = useState(false);

  // 🆕 Xử lý đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Kiểm tra xác nhận mật khẩu
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
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Xử lý cập nhật thông tin
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', infoForm);
      toast.success('✅ Cập nhật thông tin thành công!');

      // Cập nhật lại user trong context
      const newUser = {
        ...user,
        name: data.data.name,
        phone: data.data.phone,
        address: data.data.address
      };
      login(newUser);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-dark">👤 Trang cá nhân</h1>

      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 overflow-hidden mb-6">
        <div className="bg-blue-700 text-white px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="bg-white text-blue-700 font-bold text-2xl w-16 h-16 rounded-full flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="font-bold text-xl">{user?.name}</h2>
              <p className="text-blue-200 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 bg-white text-blue-700 text-xs px-3 py-1 rounded-full font-bold">
                {user?.role === 'ADMIN' ? '👑 Quản trị viên' :
                 user?.role === 'RECEPTIONIST' ? '🛎️ Lễ tân' :
                 '👤 Khách hàng'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-5 py-3 font-semibold transition border-b-4 -mb-0.5 ${
            activeTab === 'info'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-blue-600'
          }`}
        >
          📝 Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-5 py-3 font-semibold transition border-b-4 -mb-0.5 ${
            activeTab === 'password'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-red-600'
          }`}
        >
          🔒 Đổi mật khẩu
        </button>
      </div>

      {/* Tab: Thông tin cá nhân */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6">
          <h3 className="text-xl font-bold mb-4 text-dark">📝 Cập nhật thông tin</h3>

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Email (không đổi được)</label>
              <input
                type="email"
                className="input-field bg-gray-100 cursor-not-allowed"
                value={user?.email || ''}
                disabled
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Họ tên</label>
              <input
                type="text"
                className="input-field"
                value={infoForm.name}
                onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Số điện thoại</label>
              <input
                type="text"
                className="input-field"
                placeholder="VD: 0987654321"
                value={infoForm.phone}
                onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Địa chỉ</label>
              <input
                type="text"
                className="input-field"
                placeholder="VD: 123 Nguyễn Du, Hà Nội"
                value={infoForm.address}
                onChange={(e) => setInfoForm({ ...infoForm, address: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3"
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý...' : '💾 Lưu thay đổi'}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Đổi mật khẩu */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-red-200 p-6">
          <h3 className="text-xl font-bold mb-4 text-dark">🔒 Đổi mật khẩu</h3>
          <p className="text-sm text-gray-600 mb-4">
            Để bảo mật, vui lòng nhập mật khẩu cũ trước khi đổi mật khẩu mới.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">
                Mật khẩu cũ <span className="text-red-500">*</span>
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
              <label className="block mb-1 font-medium">
                Mật khẩu mới <span className="text-red-500">*</span>
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
              <label className="block mb-1 font-medium">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
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
              <p className="text-sm text-red-600">⚠️ Mật khẩu xác nhận không khớp</p>
            )}

            {passwordForm.newPassword && passwordForm.newPassword.length < 6 && (
              <p className="text-sm text-red-600">⚠️ Mật khẩu phải từ 6 ký tự trở lên</p>
            )}

            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white w-full py-3 rounded-lg font-medium transition"
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý...' : '🔒 Đổi mật khẩu'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-sm text-yellow-800">
              <strong>💡 Lưu ý bảo mật:</strong>
            </p>
            <ul className="text-sm text-yellow-700 list-disc list-inside mt-2 space-y-1">
              <li>Mật khẩu phải từ 6 ký tự trở lên</li>
              <li>Nên dùng kết hợp chữ, số và ký tự đặc biệt</li>
              <li>Không chia sẻ mật khẩu với người khác</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}