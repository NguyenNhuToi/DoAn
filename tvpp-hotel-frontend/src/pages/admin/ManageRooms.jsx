import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);

  const [form, setForm] = useState({
    roomNumber: '',
    type: 'Standard',
    price: 500000,
    capacity: 2,
    bedCount: 1,
    bedType: 'Giường đôi cực lớn',
    extraBed: true,
    description: '',
    image: '',
    amenities: 'WiFi, TV, Điều hòa',
    status: 'AVAILABLE'
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data.data);
    } catch (err) {
      toast.error('Không tải được danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const resetForm = () => {
    setForm({
      roomNumber: '',
      type: 'Standard',
      price: 500000,
      capacity: 2,
      bedCount: 1,
      bedType: 'Giường đôi cực lớn',
      extraBed: true,
      description: '',
      image: '',
      amenities: 'WiFi, TV, Điều hòa',
      status: 'AVAILABLE'
    });
    setEditingRoom(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setForm({
      roomNumber: room.roomNumber,
      type: room.type,
      price: parseInt(room.price),
      capacity: room.capacity,
      bedCount: room.bedCount || 1,
      bedType: room.bedType || 'Giường đôi cực lớn',
      extraBed: room.extraBed ?? true,
      description: room.description || '',
      image: room.image || '',
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : '',
      status: room.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const amenitiesArray = form.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a);

      const payload = {
        ...form,
        price: parseInt(form.price),
        capacity: parseInt(form.capacity),
        bedCount: parseInt(form.bedCount),
        amenities: amenitiesArray
      };

      if (editingRoom) {
        await api.put(`/rooms/${editingRoom.id}`, payload);
        toast.success('✅ Đã cập nhật phòng');
      } else {
        await api.post('/rooms', payload);
        toast.success('✅ Đã tạo phòng mới');
      }

      setShowModal(false);
      resetForm();
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi lưu phòng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, roomNumber) => {
    if (!window.confirm(`Xóa phòng ${roomNumber}?`)) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('🗑️ Đã xóa phòng');
      fetchRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  const STATUS_LABELS = {
    AVAILABLE: { text: '🟢 Còn phòng', color: 'bg-green-100 text-green-700' },
    OCCUPIED: { text: '🔴 Đã đặt', color: 'bg-red-100 text-red-700' },
    MAINTENANCE: { text: '🔧 Bảo trì', color: 'bg-yellow-100 text-yellow-700' }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/admin" className="text-primary hover:underline mb-4 inline-block">
        ← Về trang quản trị
      </Link>

      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-dark">🛏️ Quản lý phòng</h1>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          ➕ Thêm phòng
        </button>
      </div>

      {loading ? (
        <p className="text-center py-16 text-gray-500">Đang tải...</p>
      ) : rooms.length === 0 ? (
        <p className="text-center py-16 text-gray-500">Chưa có phòng nào</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const st = STATUS_LABELS[room.status] || STATUS_LABELS.AVAILABLE;
            return (
              <div key={room.id} className="bg-white rounded-xl shadow-md border-2 border-gray-100 overflow-hidden">
                <img
                  src={room.image || 'https://via.placeholder.com/400x300'}
                  alt={room.type}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-dark">Phòng {room.roomNumber}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${st.color}`}>
                      {st.text}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{room.type}</p>
                  <p className="text-secondary font-bold mb-2">{formatPrice(room.price)}/đêm</p>
                  <p className="text-xs text-gray-500 mb-3">
                    👥 {room.capacity} người • 🛏️ {room.bedCount} giường ({room.bedType})
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(room)}
                      className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 text-sm font-semibold"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(room.id, room.roomNumber)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm font-semibold"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="font-bold text-xl">
                {editingRoom ? `✏️ Sửa phòng ${editingRoom.roomNumber}` : '➕ Thêm phòng mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-white text-2xl hover:bg-blue-700 w-10 h-10 rounded-full">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-sm">Số phòng *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="VD: 101"
                    value={form.roomNumber}
                    onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Loại phòng *</label>
                  <select
                    className="input-field"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-sm">Giá/đêm (VNĐ) *</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Sức chứa</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-sm">Số giường</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.bedCount}
                    onChange={(e) => setForm({ ...form, bedCount: e.target.value })}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-sm">Loại giường</label>
                  <input
                    type="text"
                    className="input-field"
                    value={form.bedType}
                    onChange={(e) => setForm({ ...form, bedType: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">Mô tả</label>
                <textarea
                  className="input-field"
                  rows="2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">URL ảnh phòng</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="https://..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">Tiện nghi (cách nhau dấu phẩy)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="WiFi, TV, Điều hòa, Mini bar"
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-sm">Trạng thái</label>
                <select
                  className="input-field"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="AVAILABLE">🟢 Còn phòng</option>
                  <option value="OCCUPIED">🔴 Đã đặt</option>
                  <option value="MAINTENANCE">🔧 Bảo trì</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="extraBed"
                  checked={form.extraBed}
                  onChange={(e) => setForm({ ...form, extraBed: e.target.checked })}
                />
                <label htmlFor="extraBed" className="font-medium text-sm">
                  Cho phép kê thêm giường
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1 py-3"
                  disabled={submitting}
                >
                  {submitting ? '⏳ Đang lưu...' : (editingRoom ? '💾 Cập nhật' : '✅ Tạo phòng')}
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