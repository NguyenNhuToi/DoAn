import { useEffect, useState } from 'react';
import api from '../services/api';
import RoomCard from '../components/RoomCard';

export default function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rooms')
      .then(({ data }) => setRooms(data.data))
      .catch(() => console.error('Lỗi tải phòng'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-dark">Danh sách phòng</h1>
      {loading ? (
        <p className="text-center py-16 text-gray-500">Đang tải...</p>
      ) : rooms.length === 0 ? (
        <p className="text-center py-16 text-gray-500">Không có phòng nào</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => <RoomCard key={room.id} room={room} />)}
        </div>
      )}
    </div>
  );
}