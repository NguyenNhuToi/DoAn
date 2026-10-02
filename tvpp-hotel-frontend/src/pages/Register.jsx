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
      <div className="card w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-dark">Đăng ký</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Họ tên', type: 'text', required: true },
            { key: 'email', label: 'Email', type: 'email', required: true },
            { key: 'password', label: 'Mật khẩu', type: 'password', required: true },
            { key: 'phone', label: 'Số điện thoại', type: 'text' },
            { key: 'address', label: 'Địa chỉ', type: 'text' }
          ].map((field) => (
            <div key={field.key}>
              <label className="block mb-1 font-medium">{field.label}</label>
              <input
                type={field.type}
                className="input-field"
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                required={field.required}
              />
            </div>
          ))}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}