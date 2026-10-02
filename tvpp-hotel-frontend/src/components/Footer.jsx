export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-16">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột 1: Logo + Tên khách sạn */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/FooterLogo1.png"
              alt="TVPP Hotel"
              className="h-12 w-auto"
            />
            <h3 className="text-xl font-bold">TVPP HOTEL</h3>
          </div>
          <p className="text-gray-300">
            Hệ thống đặt phòng khách sạn trực tuyến hàng nhì Việt Nam.
          </p>
        </div>

        {/* Cột 2: Liên hệ */}
        <div>
          <h3 className="text-xl font-bold mb-3">Liên hệ</h3>
          <p className="text-gray-300">📍 128 Lê Trọng Tấn, Quận Hà Đông, Tp.Hà Nội</p>
          <p className="text-gray-300">📞 1900 3009</p>
          <p className="text-gray-300">✉️ tvpp19003009@hotmail.vn</p>
        </div>

        {/* Cột 3: Dịch vụ */}
        <div>
          <h3 className="text-xl font-bold mb-3">Dịch vụ</h3>
          <p className="text-gray-300">🏊 Hồ bơi</p>
          <p className="text-gray-300">🍽️ Nhà hàng</p>
          <p className="text-gray-300">💆 Spa</p>
        </div>
      </div>

      <div className="border-t border-gray-700 text-center py-4 text-gray-400">
        © 2026 TVPP Hotel. All rights reserved.
      </div>
    </footer>
  );
}