import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RoomList from './pages/RoomList';
import RoomDetail from './pages/RoomDetail';
import MyBookings from './pages/MyBookings';
import Payment from './pages/Payment';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/payment/:id" element={<Payment />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}