import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, login } = useAuth();

  const [infoForm, setInfoForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 🆕 Tự động lấy thông tin mới nhất từ server khi vào trang
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/me');

        // Cập nhật form
        setInfoForm({
          name: data.data.name || '',
          phone: data.data.phone || '',
          address: data.data.address || ''
        });

        // Cập nhật lại user trong Context + localStorage
        login({
          id: data.data.id,
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone || '',
          address: data.data.address || '',
          role: data.data.role,
          token: user?.token
        });
      } catch (err) {
        console.error('Lỗi tải profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', infoForm);
      toast.success('✅ Cập nhật thông tin thành công!');

      const newUser = {
        ...user,
        name: data.data.name,
        phone: data.data.phone,
        address: data.data.address
      };
      login(newUser);
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-dark text-center">👤 Trang cá nhân</h1>

      {/* Card thông tin cơ bản */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 overflow-hidden mb-6">
        <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-white text-blue-700 font-bold text-3xl w-20 h-20 rounded-full flex items-center justify-center shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-2xl">{user?.name}</h2>
              <p className="text-blue-100 text-sm mt-1">{user?.email}</p>
              <span className="inline-block mt-2 bg-white text-blue-700 text-xs px-3 py-1 rounded-full font-bold">
                {user?.role === 'ADMIN' ? '👑 Quản trị viên' :
                 user?.role === 'RECEPTIONIST' ? '🛎️ Lễ tân' :
                 '👤 Khách hàng'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* THÔNG TIN CÁ NHÂN */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 overflow-hidden">
        <div className="bg-blue-50 px-6 py-4 border-b-2 border-blue-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-blue-800">📝 Thông tin cá nhân</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
            >
              ✏️ Chỉnh sửa
            </button>
          )}
        </div>

        <div className="p-6">
          {!isEditing ? (
            // CHẾ ĐỘ XEM
            <div className="space-y-4">
              <div className="flex border-b border-gray-100 pb-3">
                <span className="w-40 text-gray-500 font-medium">📧 Email:</span>
                <span className="flex-1 font-semibold text-dark">{user?.email}</span>
              </div>
              <div className="flex border-b border-gray-100 pb-3">
                <span className="w-40 text-gray-500 font-medium">👤 Họ tên:</span>
                <span className="flex-1 font-semibold text-dark">{user?.name || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex border-b border-gray-100 pb-3">
                <span className="w-40 text-gray-500 font-medium">📞 Số điện thoại:</span>
                <span className="flex-1 font-semibold text-dark">{user?.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex border-b border-gray-100 pb-3">
                <span className="w-40 text-gray-500 font-medium">📍 Địa chỉ:</span>
                <span className="flex-1 font-semibold text-dark">{user?.address || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex border-b border-gray-100 pb-3">
                <span className="w-40 text-gray-500 font-medium">🎭 Vai trò:</span>
                <span className="flex-1 font-semibold text-dark">
                  {user?.role === 'ADMIN' ? '👑 Quản trị viên' :
                   user?.role === 'RECEPTIONIST' ? '🛎️ Lễ tân' :
                   '👤 Khách hàng'}
                </span>
              </div>
            </div>
          ) : (
            // CHẾ ĐỘ CHỈNH SỬA
            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-sm">📧 Email (không đổi được)</label>
                <input
                  type="email"
                  className="input-field bg-gray-100 cursor-not-allowed"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">👤 Họ tên</label>
                <input
                  type="text"
                  className="input-field"
                  value={infoForm.name}
                  onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">📞 Số điện thoại</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="VD: 0987654321"
                  value={infoForm.phone}
                  onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">📍 Địa chỉ</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="VD: 123 Nguyễn Du, Hà Nội"
                  value={infoForm.address}
                  onChange={(e) => setInfoForm({ ...infoForm, address: e.target.value })}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="btn-primary flex-1 py-3"
                  disabled={loading}
                >
                  {loading ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setInfoForm({
                      name: user?.name || '',
                      phone: user?.phone || '',
                      address: user?.address || ''
                    });
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  ❌ Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 🔒 NÚT ĐỔI MẬT KHẨU */}
      <div className="mt-6">
        <Link
          to="/change-password"
          className="block w-full bg-red-50 border-2 border-red-300 text-red-700 py-4 rounded-xl hover:bg-red-100 transition font-bold text-center text-lg shadow-md"
        >
          🔒 Đổi mật khẩu →
        </Link>
      </div>
    </div>
  );
}