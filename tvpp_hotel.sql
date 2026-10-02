-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 02, 2026 lúc 04:13 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `tvpp_hotel`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `total_price` decimal(15,2) NOT NULL,
  `status` enum('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED') DEFAULT 'PENDING',
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('UNPAID','PAID','REFUNDED') DEFAULT 'UNPAID',
  `special_requests` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `services` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`services`)),
  `adults` int(11) DEFAULT 1,
  `children` int(11) DEFAULT 0,
  `guest_name` varchar(100) DEFAULT NULL,
  `guest_phone` varchar(20) DEFAULT NULL,
  `guest_email` varchar(100) DEFAULT NULL,
  `guest_id_card` varchar(20) DEFAULT NULL,
  `children_under_6` int(11) DEFAULT 0 COMMENT 'Trẻ < 6 tuổi — miễn phí, không tính vào sức chứa',
  `children_6_12` int(11) DEFAULT 0 COMMENT 'Trẻ 6-12 tuổi — phụ thu 100k/đêm, tính vào sức chứa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `room_id`, `check_in_date`, `check_out_date`, `total_price`, `status`, `payment_method`, `payment_status`, `special_requests`, `createdAt`, `updatedAt`, `services`, `adults`, `children`, `guest_name`, `guest_phone`, `guest_email`, `guest_id_card`, `children_under_6`, `children_6_12`) VALUES
(1, 1, 6, '2026-10-02', '2026-10-12', 18300000.00, 'PENDING', 'CASH', 'UNPAID', 'Phòng tầng cao', '2026-10-02 02:03:43', '2026-10-02 02:03:43', '[\"Ăn sáng buffet\",\"Spa & Massage\",\"Thuê xe máy\",\"Tour du lịch\",\"Giặt ủi\",\"Đưa đón sân bay\"]', 2, 2, 'Hà Minh Phúc', '0986472270', 'phucHa24700@gmail.com', '001404758962', 0, 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `room_number` varchar(10) NOT NULL,
  `type` varchar(50) NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `capacity` int(11) DEFAULT 2,
  `description` text DEFAULT NULL,
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`amenities`)),
  `status` enum('AVAILABLE','OCCUPIED','MAINTENANCE') DEFAULT 'AVAILABLE',
  `image` varchar(500) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `bed_count` int(11) DEFAULT 1 COMMENT 'Số giường trong phòng',
  `bed_type` varchar(50) DEFAULT 'Giường đôi' COMMENT 'Loại giường: King, Queen, Twin, Single, Giường đôi',
  `extra_bed` tinyint(1) DEFAULT 1 COMMENT 'Có thể kê thêm giường không'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `rooms`
--

INSERT INTO `rooms` (`id`, `room_number`, `type`, `price`, `capacity`, `description`, `amenities`, `status`, `image`, `createdAt`, `updatedAt`, `bed_count`, `bed_type`, `extra_bed`) VALUES
(1, '101', 'Standard', 500000.00, 2, 'Phòng Standard view thành phố, đầy đủ tiện nghi cơ bản, phù hợp cho 2 người.', '[\"WiFi\",\"TV\",\"Điều hòa\",\"Nước nóng\"]', 'AVAILABLE', 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800', '2026-09-29 08:05:59', '2026-10-01 07:13:34', 1, 'Giường đôi lớn', 1),
(2, '102', 'Standard', 500000.00, 2, 'Phòng Standard view vườn yên tĩnh, thích hợp cho khách nghỉ dưỡng.', '[\"WiFi\",\"TV\",\"Điều hòa\"]', 'AVAILABLE', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', '2026-09-29 08:05:59', '2026-09-29 09:02:11', 1, 'Giường đôi lớn', 1),
(3, '201', 'Deluxe', 800000.00, 2, 'Phòng Deluxe view biển tuyệt đẹp, có ban công rộng, view ngắm hoàng hôn.', '[\"WiFi\",\"TV\",\"Điều hòa\",\"Mini bar\",\"Ban công\"]', 'AVAILABLE', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', '2026-09-29 08:05:59', '2026-10-02 02:02:14', 2, 'Giường đơn', 1),
(4, '202', 'Deluxe', 800000.00, 3, 'Phòng Deluxe gia đình, phù hợp cho 3 người, không gian ấm cúng.', '[\"WiFi\",\"TV\",\"Điều hòa\",\"Mini bar\"]', 'AVAILABLE', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', '2026-09-29 08:05:59', '2026-09-29 08:05:59', 2, '1 Giường đôi lớn + 1 Giường đơn', 0),
(5, '301', 'Suite', 1200000.00, 4, 'Phòng Suite VIP với bồn tắm và ban công riêng, dịch vụ cao cấp 5 sao.', '[\"WiFi\",\"TV\",\"Điều hòa\",\"Mini bar\",\"Bồn tắm\",\"Ban công\"]', 'AVAILABLE', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800', '2026-09-29 08:05:59', '2026-09-29 08:05:59', 2, '2 Giường đôi lớn', 1),
(6, '302', 'Suite', 1500000.00, 4, 'Phòng Suite Panorama view 360 độ, đỉnh cao của sự sang trọng.', '[\"WiFi\",\"TV\",\"Điều hòa\",\"Mini bar\",\"Bồn tắm\",\"View 360\"]', 'OCCUPIED', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800', '2026-09-29 08:05:59', '2026-10-02 02:03:43', 1, 'Giường đôi cực lớn', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `role` enum('CUSTOMER','ADMIN','RECEPTIONIST') DEFAULT 'CUSTOMER',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `address`, `role`, `createdAt`, `updatedAt`) VALUES
(1, 'Nguyễn Như Tới', 'hungcungg312@gmail.com', '$2b$10$mskgvncwuJmIrPa96pOTJOij7ssz0V.07rwlSPXwopAfCxNNONVc6', '0983177384', '', 'CUSTOMER', '2026-09-29 07:55:02', '2026-09-29 07:55:02'),
(2, 'Admin TVPP', 'admin@tvpp.com', '$2b$10$WwAWNwpuWnVymVYJ/PAIq.HCh3k1sKj6vAo8v42ckFHMxnXcOVkae', '0123456789', 'Hà Nội', 'ADMIN', '2026-09-29 08:05:59', '2026-09-29 08:05:59'),
(3, 'Khách Demo', 'user@tvpp.com', '$2b$10$/tPz3ViXBNBBL8nzYqd8Huef.t4zY3KaXFMAhDJ34eJ2HYAYtf5Ym', '0987654321', 'Hồ Chí Minh', 'CUSTOMER', '2026-09-29 08:05:59', '2026-09-29 08:05:59');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Chỉ mục cho bảng `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_number` (`room_number`),
  ADD UNIQUE KEY `room_number_2` (`room_number`),
  ADD UNIQUE KEY `room_number_3` (`room_number`),
  ADD UNIQUE KEY `room_number_4` (`room_number`),
  ADD UNIQUE KEY `room_number_5` (`room_number`),
  ADD UNIQUE KEY `room_number_6` (`room_number`),
  ADD UNIQUE KEY `room_number_7` (`room_number`),
  ADD UNIQUE KEY `room_number_8` (`room_number`),
  ADD UNIQUE KEY `room_number_9` (`room_number`),
  ADD UNIQUE KEY `room_number_10` (`room_number`),
  ADD UNIQUE KEY `room_number_11` (`room_number`),
  ADD UNIQUE KEY `room_number_12` (`room_number`),
  ADD UNIQUE KEY `room_number_13` (`room_number`),
  ADD UNIQUE KEY `room_number_14` (`room_number`),
  ADD UNIQUE KEY `room_number_15` (`room_number`),
  ADD UNIQUE KEY `room_number_16` (`room_number`),
  ADD UNIQUE KEY `room_number_17` (`room_number`),
  ADD UNIQUE KEY `room_number_18` (`room_number`),
  ADD UNIQUE KEY `room_number_19` (`room_number`),
  ADD UNIQUE KEY `room_number_20` (`room_number`),
  ADD UNIQUE KEY `room_number_21` (`room_number`),
  ADD UNIQUE KEY `room_number_22` (`room_number`),
  ADD UNIQUE KEY `room_number_23` (`room_number`),
  ADD UNIQUE KEY `room_number_24` (`room_number`),
  ADD UNIQUE KEY `room_number_25` (`room_number`),
  ADD UNIQUE KEY `room_number_26` (`room_number`),
  ADD UNIQUE KEY `room_number_27` (`room_number`),
  ADD UNIQUE KEY `room_number_28` (`room_number`),
  ADD UNIQUE KEY `room_number_29` (`room_number`),
  ADD UNIQUE KEY `room_number_30` (`room_number`),
  ADD UNIQUE KEY `room_number_31` (`room_number`),
  ADD UNIQUE KEY `room_number_32` (`room_number`),
  ADD UNIQUE KEY `room_number_33` (`room_number`),
  ADD UNIQUE KEY `room_number_34` (`room_number`),
  ADD UNIQUE KEY `room_number_35` (`room_number`),
  ADD UNIQUE KEY `room_number_36` (`room_number`),
  ADD UNIQUE KEY `room_number_37` (`room_number`),
  ADD UNIQUE KEY `room_number_38` (`room_number`),
  ADD UNIQUE KEY `room_number_39` (`room_number`),
  ADD UNIQUE KEY `room_number_40` (`room_number`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_79` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_80` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
