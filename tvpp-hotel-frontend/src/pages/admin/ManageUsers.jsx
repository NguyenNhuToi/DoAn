import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ROLE_LABELS = {
  ADMIN: { text: '👑 Admin', color: 'bg-purple-100 text-purple-700' },
  RECEPTIONIST: { text: '🛎️ Nhân viên', color: 'bg-yellow-100 text-yellow-700' },
  CUSTOMER: { text: '👤 Khách hàng', color: 'bg-blue-100 text-blue-700' }
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'RECEPTIONIST'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const params = filter !== 'ALL' ? { role: filter } : {};
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/users', form);
      toast.success(`✅ Đã tạo tài khoản ${form.role}!`);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', phone: '', address: '', role: 'RECEPTIONIST' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tạo thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Xóa tài khoản "${name}"?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('Đã xóa');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      toast.success(`Đã đổi vai trò thành ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi vai trò thất bại');
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/admin" className="text-primary hover:underline mb-4 inline-block">
        ← Về trang quản trị
      </Link>

      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-dark">👥 Quản lý người dùng</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          ➕ Thêm người dùng
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
        {[
          { key: 'ALL', label: `📋 Tất cả (${users.length})` },
          { key: 'ADMIN', label: '👑 Admin' },
          { key: 'RECEPTIONIST', label: '🛎️ Nhân viên' },
          { key: 'CUSTOMER', label: '👤 Khách hàng' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-3 font-semibold transition border-b-4 -mb-0.5 ${
              filter === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-blue-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center py-16 text-gray-500">Đang tải...</p>
      ) : users.length === 0 ? (
        <p className="text-center py-16 text-gray-500">Không có người dùng nào</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 border-b-2 border-blue-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-blue-800">ID</th>
                  <th className="px-4 py-3 text-left font-bold text-blue-800">Họ tên</th>
                  <th className="px-4 py-3 text-left font-bold text-blue-800">Email</th>
                  <th className="px-4 py-3 text-left font-bold text-blue-800">SĐT</th>
                  <th className="px-4 py-3 text-left font-bold text-blue-800">Vai trò</th>
                  <th className="px-4 py-3 text-left font-bold text-blue-800">Ngày tạo</th>
                  <th className="px-4 py-3 text-center font-bold text-blue-800">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold">#{u.id}</td>
                    <td className="px-4 py-3 font-semibold">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border-0 cursor-pointer ${ROLE_LABELS[u.role]?.color}`}
                      >
                        <option value="CUSTOMER">👤 Khách hàng</option>
                        <option value="RECEPTIONIST">🛎️ Nhân viên</option>
                        <option value="ADMIN">👑 Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-xs"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL THÊM USER */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-bold text-xl">➕ Thêm người dùng mới</h2>
              <button onClick={() => setShowModal(false)} className="text-white text-2xl hover:bg-blue-700 w-10 h-10 rounded-full">✕</button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block mb-1 font-medium text-sm">👤 Họ tên *</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">📧 Email *</label>
                <input
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">🔒 Mật khẩu *</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Ít nhất 6 ký tự"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">📞 Số điện thoại</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">📍 Địa chỉ</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">🎭 Vai trò *</label>
                <select
                  className="input-field"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="CUSTOMER">👤 Khách hàng (CUSTOMER)</option>
                  <option value="RECEPTIONIST">🛎️ Nhân viên lễ tân (RECEPTIONIST)</option>
                  <option value="ADMIN">👑 Quản trị viên (ADMIN)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1 py-3"
                  disabled={submitting}
                >
                  {submitting ? '⏳ Đang tạo...' : '✅ Tạo tài khoản'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  ❌ Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}