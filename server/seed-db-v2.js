/**
 * Seed Azure SQL database with all data.
 * Uses single batch queries to keep IDENTITY_INSERT scope.
 */
const sql = require('mssql');

const config = {
  server: 'sale-web-server.database.windows.net',
  port: 1433,
  user: 'salesadmin@sale-web-server',
  password: 'SaleWeb@2024!',
  database: 'footballteam',
  options: { encrypt: true, trustServerCertificate: true },
  requestTimeout: 120000,
  connectionTimeout: 30000,
};

async function run() {
  let pool;
  try {
    console.log('Connecting to Azure SQL...');
    pool = await sql.connect(config);
    console.log('Connected!\n');

    // Show current state
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME
    `);
    for (const r of tablesResult.recordset) {
      const cnt = await pool.request().query(`SELECT COUNT(*) as cnt FROM [${r.TABLE_NAME}]`);
      console.log(`  [${r.TABLE_NAME}] = ${cnt.recordset[0].cnt} rows`);
    }
    console.log('');

    // Seed VaiTro
    const vaiTroCount = (await pool.request().query(`SELECT COUNT(*) as cnt FROM VaiTro`)).recordset[0].cnt;
    if (vaiTroCount === 0) {
      console.log('Seeding VaiTro...');
      await pool.request().batch(`
        SET IDENTITY_INSERT [dbo].[VaiTro] ON;
        INSERT [dbo].[VaiTro] ([MaVaiTro],[TenVaiTro]) VALUES (1,N'Admin');
        INSERT [dbo].[VaiTro] ([MaVaiTro],[TenVaiTro]) VALUES (2,N'Sinh viên');
        INSERT [dbo].[VaiTro] ([MaVaiTro],[TenVaiTro]) VALUES (3,N'Nhân viên trực sân');
        SET IDENTITY_INSERT [dbo].[VaiTro] OFF;
      `);
      console.log('  ✓ VaiTro seeded');
    }

    // Seed LoaiSan (check if missing entries)
    const loaiSanCount = (await pool.request().query(`SELECT COUNT(*) as cnt FROM LoaiSan`)).recordset[0].cnt;
    if (loaiSanCount < 4) {
      console.log('Seeding LoaiSan...');
      try {
        await pool.request().batch(`
          SET IDENTITY_INSERT [dbo].[LoaiSan] ON;
          IF NOT EXISTS (SELECT 1 FROM LoaiSan WHERE MaLoaiSan=1) INSERT [dbo].[LoaiSan] ([MaLoaiSan],[TenLoaiSan]) VALUES (1,N'Cầu lông-Pickleball-Tennis');
          IF NOT EXISTS (SELECT 1 FROM LoaiSan WHERE MaLoaiSan=2) INSERT [dbo].[LoaiSan] ([MaLoaiSan],[TenLoaiSan]) VALUES (2,N'Bóng đá');
          IF NOT EXISTS (SELECT 1 FROM LoaiSan WHERE MaLoaiSan=3) INSERT [dbo].[LoaiSan] ([MaLoaiSan],[TenLoaiSan]) VALUES (3,N'Bóng rổ');
          IF NOT EXISTS (SELECT 1 FROM LoaiSan WHERE MaLoaiSan=4) INSERT [dbo].[LoaiSan] ([MaLoaiSan],[TenLoaiSan]) VALUES (4,N'Bóng chuyền');
          SET IDENTITY_INSERT [dbo].[LoaiSan] OFF;
        `);
        console.log('  ✓ LoaiSan seeded');
      } catch(e) { console.log('  ⚠ LoaiSan:', e.message.slice(0,80)); }
    }

    // Seed NguoiDung
    const nguoiDungCount = (await pool.request().query(`SELECT COUNT(*) as cnt FROM NguoiDung`)).recordset[0].cnt;
    if (nguoiDungCount === 0) {
      console.log('Seeding NguoiDung...');
      await pool.request().batch(`
        SET IDENTITY_INSERT [dbo].[NguoiDung] ON;
        INSERT [dbo].[NguoiDung] ([UserID],[Username],[MatKhau],[MSV],[Lop],[HoTen],[SDT],[EmailTruong],[EmailCaNhan],[AnhDaiDien],[TrangThai],[DiemUyTin],[MaVaiTro]) VALUES
          (1,N'sv1',N'123456',N'231121521228',N'49K21.2',N'Nguyễn Văn An',N'0905123456',N'231121521228@due.udn.vn',N'an@gmail.com',NULL,0,40,2),
          (2,N'sv2',N'123456',N'231121521229',N'49K21.2',N'Trần Thị Bình',N'0905234567',N'231121521229@due.udn.vn',N'binh@gmail.com',NULL,1,100,2),
          (3,N'sv3',N'123456',N'231121521230',N'49K21.2',N'Lê Văn Cường',N'0905345678',N'231121521230@due.udn.vn',N'cuong@gmail.com',NULL,1,100,2),
          (4,N'sv4',N'123456',N'231121521231',N'49K21.2',N'Phạm Thị Dung',N'0905456789',N'231121521231@due.udn.vn',N'dung@gmail.com',NULL,1,100,2),
          (5,N'sv5',N'123456',N'231121521232',N'49K21.2',N'Hoàng Văn Đức',N'0905567890',N'231121521232@due.udn.vn',N'duc@gmail.com',NULL,1,100,2),
          (6,N'sv6',N'123456',N'231121521233',N'49K21.2',N'Đặng Thị Hạnh',N'0905678901',N'231121521233@due.udn.vn',N'hanh@gmail.com',NULL,1,100,2),
          (7,N'admin',N'$2b$10$H6wjL8TnFObz75N8sHJ6uePv91MkTXJ687QqePKQQrYKNJVeMkmFy',NULL,NULL,N'Quản Trị Hệ Thống',N'0912345678',N'admin@due.udn.vn',N'admin@gmail.com',NULL,1,100,1),
          (8,N'nv1',N'123456',NULL,NULL,N'Nguyễn Văn Hùng',N'0913456789',N'nv1@due.udn.vn',N'hung@gmail.com',NULL,1,100,3),
          (9,N'nv2',N'123456',NULL,NULL,N'Lê Thị Lan',N'0914567890',N'nv2@due.udn.vn',N'lan@gmail.com',NULL,1,100,3),
          (10,N'nv3',N'123456',NULL,NULL,N'Trần Văn Minh',N'0915678901',N'nv3@due.udn.vn',N'minh@gmail.com',NULL,1,100,3);
        SET IDENTITY_INSERT [dbo].[NguoiDung] OFF;
      `);
      console.log('  ✓ NguoiDung seeded (10 users)');
    }

    // Seed SanBai (if < 6)
    // Migration: Thêm cột SoNgayDatTruoc nếu chưa có
    try {
      const colExists = await pool.request().query(`
        SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'SanBai' AND COLUMN_NAME = 'SoNgayDatTruoc'
      `);
      if (colExists.recordset.length === 0) {
        await pool.request().query(`ALTER TABLE [dbo].[SanBai] ADD [SoNgayDatTruoc] INT NOT NULL DEFAULT 7`);
        console.log('  ✓ Added SoNgayDatTruoc column to SanBai');
      }
    } catch(e) { console.log('  ⚠ Migration SoNgayDatTruoc:', e.message.slice(0,120)); }

    const sanBaiCount = (await pool.request().query(`SELECT COUNT(*) as cnt FROM SanBai`)).recordset[0].cnt;
    if (sanBaiCount < 6) {
      console.log('Seeding SanBai...');
      try {
        await pool.request().batch(`
          SET IDENTITY_INSERT [dbo].[SanBai] ON;
          IF NOT EXISTS (SELECT 1 FROM SanBai WHERE MaSan=1) INSERT [dbo].[SanBai] ([MaSan],[TenSan],[ViTri],[HinhAnh],[GiaThue],[MaLoaiSan],[TrangThai],[SoNgayDatTruoc]) VALUES (1,N'Sân Cầu Lông 1',N'Trong nhà',NULL,80000,1,N'Hoạt động',7);
          IF NOT EXISTS (SELECT 1 FROM SanBai WHERE MaSan=2) INSERT [dbo].[SanBai] ([MaSan],[TenSan],[ViTri],[HinhAnh],[GiaThue],[MaLoaiSan],[TrangThai],[SoNgayDatTruoc]) VALUES (2,N'Sân Cầu Lông 2',N'Ngoài trời',NULL,80000,1,N'Hoạt động',7);
          IF NOT EXISTS (SELECT 1 FROM SanBai WHERE MaSan=3) INSERT [dbo].[SanBai] ([MaSan],[TenSan],[ViTri],[HinhAnh],[GiaThue],[MaLoaiSan],[TrangThai],[SoNgayDatTruoc]) VALUES (3,N'Sân Bóng Rổ',N'Ngoài trời',NULL,80000,3,N'Hoạt động',7);
          IF NOT EXISTS (SELECT 1 FROM SanBai WHERE MaSan=4) INSERT [dbo].[SanBai] ([MaSan],[TenSan],[ViTri],[HinhAnh],[GiaThue],[MaLoaiSan],[TrangThai],[SoNgayDatTruoc]) VALUES (4,N'Sân Bóng Chuyền',N'Ngoài trời',NULL,80000,4,N'Hoạt động',7);
          IF NOT EXISTS (SELECT 1 FROM SanBai WHERE MaSan=5) INSERT [dbo].[SanBai] ([MaSan],[TenSan],[ViTri],[HinhAnh],[GiaThue],[MaLoaiSan],[TrangThai],[SoNgayDatTruoc]) VALUES (5,N'Sân Bóng Đá 1',N'Ngoài trời',NULL,200000,2,N'Hoạt động',7);
          IF NOT EXISTS (SELECT 1 FROM SanBai WHERE MaSan=6) INSERT [dbo].[SanBai] ([MaSan],[TenSan],[ViTri],[HinhAnh],[GiaThue],[MaLoaiSan],[TrangThai],[SoNgayDatTruoc]) VALUES (6,N'Sân Bóng Đá 2',N'Ngoài trời',NULL,200000,2,N'Hoạt động',7);
          SET IDENTITY_INSERT [dbo].[SanBai] OFF;
        `);
        console.log('  ✓ SanBai seeded');
      } catch(e) { console.log('  ⚠ SanBai:', e.message.slice(0,120)); }
    }

    // Seed LichSan
    const lichSanCount = (await pool.request().query(`SELECT COUNT(*) as cnt FROM LichSan`)).recordset[0].cnt;
    if (lichSanCount < 33) {
      console.log('Seeding LichSan...');
      try {
        await pool.request().batch(`
          SET IDENTITY_INSERT [dbo].[LichSan] ON;
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=1) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (1,1,'2026-03-10','05:30:00','06:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=2) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (2,1,'2026-03-10','16:30:00','17:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=3) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (3,1,'2026-03-10','17:30:00','19:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=4) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (4,1,'2026-03-10','19:30:00','21:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=5) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (5,2,'2026-03-10','05:30:00','06:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=6) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (6,2,'2026-03-10','16:30:00','17:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=7) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (7,2,'2026-03-10','17:30:00','19:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=8) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (8,2,'2026-03-10','19:30:00','21:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=9) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (9,3,'2026-03-10','05:30:00','06:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=10) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (10,3,'2026-03-10','16:30:00','17:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=11) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (11,3,'2026-03-10','17:30:00','19:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=12) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (12,3,'2026-03-10','19:30:00','21:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=13) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (13,4,'2026-03-10','05:30:00','06:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=14) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (14,4,'2026-03-10','16:30:00','17:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=15) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (15,4,'2026-03-10','17:30:00','19:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=16) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (16,4,'2026-03-10','19:30:00','21:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=17) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (17,5,'2026-03-10','05:30:00','06:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=18) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (18,5,'2026-03-10','16:30:00','17:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=19) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (19,5,'2026-03-10','17:30:00','19:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=20) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (20,5,'2026-03-10','19:30:00','21:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=21) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (21,6,'2026-03-10','05:30:00','06:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=22) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (22,6,'2026-03-10','16:30:00','17:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=23) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (23,6,'2026-03-10','17:30:00','19:30:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=24) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (24,6,'2026-03-10','19:30:00','21:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=25) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (25,1,'2026-03-15','06:00:00','08:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=26) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (26,1,'2026-03-15','08:00:00','10:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=27) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (27,1,'2026-03-15','10:00:00','12:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=28) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (28,1,'2026-03-15','14:00:00','16:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=29) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (29,1,'2026-03-15','16:00:00','18:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=30) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (30,1,'2026-03-15','18:00:00','20:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=31) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (31,1,'2026-03-30','08:00:00','10:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=32) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (32,1,'2026-03-30','10:00:00','12:00:00');
          IF NOT EXISTS (SELECT 1 FROM LichSan WHERE MaLichSan=33) INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (33,2,'2026-03-30','08:00:00','10:00:00');
          SET IDENTITY_INSERT [dbo].[LichSan] OFF;
        `);
        console.log('  ✓ LichSan seeded');
      } catch(e) { console.log('  ⚠ LichSan:', e.message.slice(0,120)); }
    }

    // Seed DatSan
    const datSanCount = (await pool.request().query(`SELECT COUNT(*) as cnt FROM DatSan`)).recordset[0].cnt;
    if (datSanCount < 20) {
      console.log('Seeding DatSan...');
      // First clear existing incomplete data
      try { await pool.request().query(`DELETE FROM VeDienTu; DELETE FROM ThanhToan; DELETE FROM ChiTietDatSan; DELETE FROM DatSan WHERE MaDatSan > 0;`); } catch(e) {}
      try {
        await pool.request().batch(`
          SET IDENTITY_INSERT [dbo].[DatSan] ON;
          INSERT [dbo].[DatSan] ([MaDatSan],[UserID],[MaLichSan],[NgayDat],[TongTien],[TrangThai],[NguoiDuyet]) VALUES
            (1,1,1,'2026-03-12T00:05:23.383',80000,N'Đã duyệt',7),
            (2,2,2,'2026-03-12T00:05:23.383',80000,N'Đã thanh toán',7),
            (3,3,3,'2026-03-12T00:05:23.383',80000,N'Đã check-in',7),
            (4,4,4,'2026-03-12T00:05:23.383',80000,N'Hoàn thành',7),
            (5,5,5,'2026-03-12T00:05:23.383',80000,N'Chờ duyệt',NULL),
            (6,6,6,'2026-03-12T00:05:23.383',80000,N'Bị từ chối',7),
            (7,1,7,'2026-03-12T00:05:23.383',100000,N'Đã duyệt',7),
            (8,2,8,'2026-03-12T00:05:23.383',100000,N'Đã thanh toán',7),
            (9,3,9,'2026-03-12T00:05:23.383',100000,N'Đã check-in',7),
            (10,4,10,'2026-03-12T00:05:23.383',100000,N'Bị từ chối',1),
            (11,5,11,'2026-03-12T00:05:23.383',120000,N'No-show',7),
            (12,6,12,'2026-03-12T00:05:23.383',120000,N'Đã hủy',NULL),
            (13,1,13,'2026-03-12T00:05:23.383',200000,N'Đã duyệt',7),
            (14,2,14,'2026-03-12T00:05:23.383',200000,N'Đã thanh toán',7),
            (15,3,15,'2026-03-12T00:05:23.383',200000,N'Đã check-in',7),
            (16,4,16,'2026-03-12T00:05:23.383',200000,N'Hoàn thành',7),
            (17,5,17,'2026-03-12T00:05:23.383',150000,N'Chờ duyệt',NULL),
            (18,6,18,'2026-03-12T00:05:23.383',150000,N'Đã duyệt',7),
            (19,1,19,'2026-03-12T00:05:23.383',150000,N'Đã thanh toán',7),
            (20,2,20,'2026-03-12T00:05:23.383',150000,N'Đã check-in',7);
          SET IDENTITY_INSERT [dbo].[DatSan] OFF;
        `);
        console.log('  ✓ DatSan seeded (20 bookings)');
      } catch(e) { console.log('  ⚠ DatSan:', e.message.slice(0,120)); }
    }

    // Seed VeDienTu
    const veCount = (await pool.request().query(`SELECT COUNT(*) as cnt FROM VeDienTu`)).recordset[0].cnt;
    if (veCount === 0) {
      console.log('Seeding VeDienTu...');
      try {
        await pool.request().batch(`
          INSERT [dbo].[VeDienTu] ([MaVe],[MaDatSan],[QRCode],[ThoiGianCheckIn],[ThoiGianCheckOut]) VALUES
            ('VE000000001',1,'QR_1',NULL,NULL),
            ('VE000000002',2,'QR_2',NULL,NULL),
            ('VE000000003',3,'QR_3','2026-03-12T00:08:46.527',NULL),
            ('VE000000004',4,'QR_4','2026-03-12T00:08:46.527','2026-03-12T01:08:46.527'),
            ('VE000000005',5,'QR_5',NULL,NULL),
            ('VE000000006',6,'QR_6',NULL,NULL),
            ('VE000000007',7,'QR_7',NULL,NULL),
            ('VE000000008',8,'QR_8',NULL,NULL),
            ('VE000000009',9,'QR_9','2026-03-12T00:08:46.527',NULL),
            ('VE000000010',10,'QR_10','2026-03-12T00:08:46.527','2026-03-12T01:08:46.527'),
            ('VE000000011',11,'QR_11',NULL,NULL),
            ('VE000000012',12,'QR_12',NULL,NULL),
            ('VE000000013',13,'QR_13',NULL,NULL),
            ('VE000000014',14,'QR_14',NULL,NULL),
            ('VE000000015',15,'QR_15','2026-03-12T00:08:46.527',NULL),
            ('VE000000016',16,'QR_16','2026-03-12T00:08:46.527','2026-03-12T01:08:46.527'),
            ('VE000000017',17,'QR_17',NULL,NULL),
            ('VE000000018',18,'QR_18',NULL,NULL),
            ('VE000000019',19,'QR_19',NULL,NULL),
            ('VE000000020',20,'QR_20','2026-03-12T00:08:46.527',NULL);
        `);
        console.log('  ✓ VeDienTu seeded (20 tickets)');
      } catch(e) { console.log('  ⚠ VeDienTu:', e.message.slice(0,120)); }
    }

    // Seed ThanhToan
    const ttCount = (await pool.request().query(`SELECT COUNT(*) as cnt FROM ThanhToan`)).recordset[0].cnt;
    if (ttCount === 0) {
      console.log('Seeding ThanhToan...');
      try {
        await pool.request().batch(`
          SET IDENTITY_INSERT [dbo].[ThanhToan] ON;
          INSERT [dbo].[ThanhToan] ([MaThanhToan],[MaDatSan],[PhuongThuc],[ThoiGianThanhToan],[TrangThaiThanhToan],[NhanVienKiemTra]) VALUES
            (1,1,NULL,NULL,0,NULL),
            (2,2,1,'2026-03-12T00:14:25.660',1,8),
            (3,3,1,'2026-03-12T00:14:25.660',1,9),
            (4,4,0,'2026-03-12T00:14:25.660',1,8),
            (5,5,NULL,NULL,0,NULL),
            (6,6,NULL,NULL,0,NULL),
            (7,7,1,'2026-03-12T00:14:25.660',1,9),
            (8,8,0,'2026-03-12T00:14:25.660',1,8),
            (9,9,1,'2026-03-12T00:14:25.660',1,9),
            (10,10,0,'2026-03-12T00:14:25.660',1,10),
            (11,11,1,'2026-03-12T00:14:25.660',1,8),
            (12,12,NULL,NULL,0,NULL),
            (13,13,1,'2026-03-12T00:14:25.660',1,10),
            (14,14,1,'2026-03-12T00:14:25.660',1,9),
            (15,15,0,'2026-03-12T00:14:25.660',1,8),
            (16,16,0,'2026-03-12T00:14:25.660',1,9),
            (17,17,NULL,NULL,0,NULL),
            (18,18,1,'2026-03-12T00:14:25.660',1,8),
            (19,19,1,'2026-03-12T00:14:25.660',1,9),
            (20,20,0,'2026-03-12T00:14:25.660',1,10);
          SET IDENTITY_INSERT [dbo].[ThanhToan] OFF;
        `);
        console.log('  ✓ ThanhToan seeded (20 payments)');
      } catch(e) { console.log('  ⚠ ThanhToan:', e.message.slice(0,120)); }
    }

    // Seed ChiTietDatSan
    const ctCount = (await pool.request().query(`SELECT COUNT(*) as cnt FROM ChiTietDatSan`)).recordset[0].cnt;
    if (ctCount === 0) {
      console.log('Seeding ChiTietDatSan...');
      try {
        await pool.request().batch(`
          SET IDENTITY_INSERT [dbo].[ChiTietDatSan] ON;
          INSERT [dbo].[ChiTietDatSan] ([MaChiTiet],[MaDatSan],[GiaTheoGio]) VALUES
            (1,1,80000),(2,2,80000),(3,3,80000),(4,4,80000),(5,5,80000),(6,6,80000),
            (7,7,100000),(8,8,100000),(9,9,100000),(10,10,100000),
            (11,11,120000),(12,12,120000),
            (13,13,200000),(14,14,200000),(15,15,200000),(16,16,200000),
            (17,17,150000),(18,18,150000),(19,19,150000),(20,20,150000);
          SET IDENTITY_INSERT [dbo].[ChiTietDatSan] OFF;
        `);
        console.log('  ✓ ChiTietDatSan seeded (20 records)');
      } catch(e) { console.log('  ⚠ ChiTietDatSan:', e.message.slice(0,120)); }
    }

    // Seed LichSuDiem
    const lsdCount = (await pool.request().query(`SELECT COUNT(*) as cnt FROM LichSuDiem`)).recordset[0].cnt;
    if (lsdCount === 0) {
      console.log('Seeding LichSuDiem...');
      try {
        await pool.request().batch(`
          SET IDENTITY_INSERT [dbo].[LichSuDiem] ON;
          INSERT [dbo].[LichSuDiem] ([MaCapNhat],[UserID],[ThoiGianCapNhat],[DiemThayDoi],[GhiChu]) VALUES
            (1,4,'2026-03-12T00:13:00.790',5,N'Hoàn thành đặt sân #4'),
            (2,4,'2026-03-12T00:13:00.790',5,N'Hoàn thành đặt sân #10'),
            (3,4,'2026-03-12T00:13:00.790',5,N'Hoàn thành đặt sân #16'),
            (4,3,'2026-03-12T00:13:00.790',2,N'Check-in trễ đặt sân #3'),
            (5,3,'2026-03-12T00:13:00.790',2,N'Check-in trễ đặt sân #9'),
            (6,3,'2026-03-12T00:13:00.790',2,N'Check-in trễ đặt sân #15'),
            (7,2,'2026-03-12T00:13:00.790',2,N'Check-in trễ đặt sân #20'),
            (8,5,'2026-03-12T00:13:00.790',-5,N'No-show đặt sân #11'),
            (9,6,'2026-03-12T00:13:00.790',-10,N'Đã hủy đặt sân #12');
          SET IDENTITY_INSERT [dbo].[LichSuDiem] OFF;
        `);
        console.log('  ✓ LichSuDiem seeded (9 records)');
      } catch(e) { console.log('  ⚠ LichSuDiem:', e.message.slice(0,120)); }
    }

    // Final verification
    console.log('\n========== VERIFICATION ==========');
    const finalTables = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME
    `);
    for (const r of finalTables.recordset) {
      const countResult = await pool.request().query(`SELECT COUNT(*) as cnt FROM [${r.TABLE_NAME}]`);
      console.log(`  [${r.TABLE_NAME}] = ${countResult.recordset[0].cnt} rows`);
    }
    console.log('\n✅ Database update complete!');

  } catch (err) {
    console.error('ERROR:', err.message);
    if (err.precedingErrors) {
      for (const e of err.precedingErrors) console.error('  -', e.message);
    }
  } finally {
    if (pool) await pool.close();
  }
}

run();
