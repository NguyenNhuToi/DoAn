const mysql = require('mysql2/promise');
const { sequelize, User, Room } = require('./models');
require('dotenv').config();

const ROOMS_DATA = [
  {
    roomNumber: '101',
    type: 'Standard',
    price: 500000,
    capacity: 2,
    description: 'Phòng Standard view thành phố, đầy đủ tiện nghi cơ bản, phù hợp cho 2 người.',
    amenities: ['WiFi', 'TV', 'Điều hòa', 'Nước nóng'],
    status: 'AVAILABLE',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'
  },
  {
    roomNumber: '102',
    type: 'Standard',
    price: 500000,
    capacity: 2,
    description: 'Phòng Standard view vườn yên tĩnh, thích hợp cho khách nghỉ dưỡng.',
    amenities: ['WiFi', 'TV', 'Điều hòa'],
    status: 'AVAILABLE',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
  },
  {
    roomNumber: '201',
    type: 'Deluxe',
    price: 800000,
    capacity: 2,
    description: 'Phòng Deluxe view biển tuyệt đẹp, có ban công rộng, view ngắm hoàng hôn.',
    amenities: ['WiFi', 'TV', 'Điều hòa', 'Mini bar', 'Ban công'],
    status: 'AVAILABLE',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
  },
  {
    roomNumber: '202',
    type: 'Deluxe',
    price: 800000,
    capacity: 3,
    description: 'Phòng Deluxe gia đình, phù hợp cho 3 người, không gian ấm cúng.',
    amenities: ['WiFi', 'TV', 'Điều hòa', 'Mini bar'],
    status: 'AVAILABLE',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'
  },
  {
    roomNumber: '301',
    type: 'Suite',
    price: 1200000,
    capacity: 4,
    description: 'Phòng Suite VIP với bồn tắm và ban công riêng, dịch vụ cao cấp 5 sao.',
    amenities: ['WiFi', 'TV', 'Điều hòa', 'Mini bar', 'Bồn tắm', 'Ban công'],
    status: 'AVAILABLE',
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800'
  },
  {
    roomNumber: '302',
    type: 'Suite',
    price: 1500000,
    capacity: 4,
    description: 'Phòng Suite Panorama view 360 độ, đỉnh cao của sự sang trọng.',
    amenities: ['WiFi', 'TV', 'Điều hòa', 'Mini bar', 'Bồn tắm', 'View 360'],
    status: 'AVAILABLE',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'
  }
];

const ensureDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await connection.end();
};

const seed = async () => {
  try {
    console.log('🌱 Bắt đầu seed dữ liệu...\n');

    // 1. Tạo database nếu chưa có
    await ensureDatabase();
    console.log('✅ Đã kiểm tra database');

    // 2. Kết nối và đồng bộ models
    await sequelize.authenticate();
    console.log('✅ Kết nối MySQL thành công');

    await sequelize.sync({ alter: true });
    console.log('✅ Đồng bộ models thành công\n');

    // 3. Tạo tài khoản Admin (nếu chưa có)
    const [admin, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@tvpp.com' },
      defaults: {
        name: 'Admin TVPP',
        email: 'admin@tvpp.com',
        password: 'admin123',
        phone: '0123456789',
        address: 'Hà Nội',
        role: 'ADMIN'
      }
    });
    console.log(adminCreated
      ? `✅ Đã tạo Admin: admin@tvpp.com / admin123`
      : `ℹ️  Admin đã tồn tại: admin@tvpp.com`
    );

    // 4. Tạo tài khoản khách hàng demo (nếu chưa có)
    const [customer, customerCreated] = await User.findOrCreate({
      where: { email: 'user@tvpp.com' },
      defaults: {
        name: 'Khách Demo',
        email: 'user@tvpp.com',
        password: 'user123',
        phone: '0987654321',
        address: 'Hồ Chí Minh',
        role: 'CUSTOMER'
      }
    });
    console.log(customerCreated
      ? `✅ Đã tạo Khách hàng: user@tvpp.com / user123`
      : `ℹ️  Khách hàng đã tồn tại: user@tvpp.com`
    );

    // 5. Tạo 6 phòng
    console.log('\n🏨 Đang tạo 6 phòng...');
    let roomCount = 0;
    for (const roomData of ROOMS_DATA) {
      const [room, created] = await Room.findOrCreate({
        where: { roomNumber: roomData.roomNumber },
        defaults: roomData
      });
      if (created) {
        roomCount++;
        console.log(`   ✅ Phòng ${room.roomNumber} - ${room.type} - ${room.price.toLocaleString('vi-VN')}đ`);
      } else {
        console.log(`   ℹ️  Phòng ${room.roomNumber} đã tồn tại`);
      }
    }

    console.log(`\n📊 TỔNG KẾT:`);
    console.log(`   - Tổng số phòng: ${await Room.count()}`);
    console.log(`   - Tổng số user: ${await User.count()}`);
    console.log(`   - Phòng mới thêm: ${roomCount}`);
    console.log(`\n🎉 Seed hoàn tất!\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi seed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seed();