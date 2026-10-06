import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import StaffLogin from './pages/StaffLogin';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import RoomList from './pages/RoomList';
import RoomDetail from './pages/RoomDetail';
import MyBookings from './pages/MyBookings';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageRooms from './pages/admin/ManageRooms';
import AdminManageBookings from './pages/admin/ManageBookings';
import Reports from './pages/admin/Reports';

// Staff
import StaffDashboard from './pages/staff/StaffDashboard';
import ManageBookings from './pages/staff/ManageBookings';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* 3 cổng đăng nhập */}
          <Route path="/login" element={<Login />} />
          <Route path="/staff/login" element={<StaffLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/register" element={<Register />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/payment/:id" element={<Payment />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/rooms" element={<ManageRooms />} />
          <Route path="/admin/bookings" element={<AdminManageBookings />} />
          <Route path="/admin/reports" element={<Reports />} />

          {/* Staff */}
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/staff/bookings" element={<ManageBookings />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}