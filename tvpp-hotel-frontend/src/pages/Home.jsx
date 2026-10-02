import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <div className="relative h-125 bg-linear-to-r from-primary to-blue-900 text-white flex items-center justify-center">
        <img
          src="./public/Banner.png"
          alt="Hotel"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Chào mừng đến TVPP Hotel</h1>
          <br></br>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Trải nghiệm kỳ nghỉ tuyệt vời với dịch vụ đẳng cấp 5 sao
          </p>
          <Link to="/rooms" className="btn-secondary text-lg px-8 py-3">
            Đặt phòng ngay →
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-dark">Dịch vụ của chúng tôi</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: '🏊', title: 'Hồ bơi', desc: 'Hồ bơi vô cực view biển' },
            { icon: '🍽️', title: 'Nhà hàng', desc: 'Ẩm thực Á - Âu đa dạng' },
            { icon: '💆', title: 'Spa', desc: 'Thư giãn với dịch vụ spa' },
            { icon: '🚗', title: 'Đưa đón', desc: 'Đưa đón sân bay miễn phí' }
          ].map((item, i) => (
            <div key={i} className="card p-6 text-center">
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-dark">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-dark text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng đặt phòng?</h2>
          <p className="text-gray-300 mb-6">ĐẶT NGAY HÔM NAY!</p>
          <Link to="/rooms" className="btn-secondary text-lg px-8 py-3">
            Xem danh sách phòng
          </Link>
        </div>
      </div>
    </div>
  );
}