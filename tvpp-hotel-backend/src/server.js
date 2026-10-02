const mysql = require('mysql2/promise');
const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Tự động tạo database nếu chưa tồn tại
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
  console.log('✅ Đã kiểm tra/tạo database');
};

const startServer = async () => {
  try {
    await ensureDatabase();
    await sequelize.authenticate();
    console.log('✅ Kết nối MySQL thành công');

    await sequelize.sync({ alter: true });
    console.log('✅ Đồng bộ models thành công');

    app.listen(PORT, () => {
      console.log(`🚀 Server: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

startServer();