/**
 * Script to set up the Azure SQL database with missing tables and seed data.
 * Uses the mssql package from node_modules.
 */
const sql = require('mssql');

const config = {
  server: 'sale-web-server.database.windows.net',
  port: 1433,
  user: 'salesadmin@sale-web-server',
  password: 'SaleWeb@2024!',
  database: 'QuanLyDatSan',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  requestTimeout: 60000,
  connectionTimeout: 30000,
};

async function run() {
  let pool;
  try {
    console.log('Connecting to Azure SQL...');
    pool = await sql.connect(config);
    console.log('Connected!\n');

    // Check existing tables
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME
    `);
    const existingTables = tablesResult.recordset.map(r => r.TABLE_NAME);
    console.log('Existing tables:', existingTables.join(', '));
    console.log('');

    // Define all tables in correct order (respecting FK dependencies)
    const allTables = [
      'VaiTro', 'LoaiSan', 'NguoiDung', 'SanBai', 'LichSan',
      'DatSan', 'ChiTietDatSan', 'ThanhToan', 'VeDienTu',
      'LichSuDiem', 'OtpKhoiPhucMatKhau'
    ];

    const missingTables = allTables.filter(t => !existingTables.includes(t));
    console.log('Missing tables:', missingTables.length ? missingTables.join(', ') : 'None');
    console.log('');

    if (missingTables.length === 0) {
      console.log('All tables already exist! Nothing to do.');
      return;
    }

    // Create tables in dependency order
    const createStatements = {
      VaiTro: `
        CREATE TABLE [dbo].[VaiTro](
          [MaVaiTro] [int] IDENTITY(1,1) NOT NULL,
          [TenVaiTro] [nvarchar](50) NOT NULL,
          PRIMARY KEY CLUSTERED ([MaVaiTro] ASC)
        )`,
      LoaiSan: `
        CREATE TABLE [dbo].[LoaiSan](
          [MaLoaiSan] [int] IDENTITY(1,1) NOT NULL,
          [TenLoaiSan] [nvarchar](80) NOT NULL,
          PRIMARY KEY CLUSTERED ([MaLoaiSan] ASC)
        )`,
      NguoiDung: `
        CREATE TABLE [dbo].[NguoiDung](
          [UserID] [int] IDENTITY(1,1) NOT NULL,
          [Username] [nvarchar](50) NOT NULL,
          [MatKhau] [nvarchar](255) NOT NULL,
          [MSV] [varchar](12) NULL,
          [Lop] [varchar](10) NULL,
          [HoTen] [nvarchar](100) NOT NULL,
          [SDT] [varchar](10) NULL,
          [EmailTruong] [varchar](80) NULL,
          [EmailCaNhan] [varchar](80) NULL,
          [AnhDaiDien] [nvarchar](255) NULL,
          [TrangThai] [bit] NULL DEFAULT ((1)),
          [DiemUyTin] [int] NOT NULL DEFAULT ((100)),
          [MaVaiTro] [int] NOT NULL,
          PRIMARY KEY CLUSTERED ([UserID] ASC)
        )`,
      SanBai: `
        CREATE TABLE [dbo].[SanBai](
          [MaSan] [int] IDENTITY(1,1) NOT NULL,
          [TenSan] [nvarchar](80) NOT NULL,
          [ViTri] [nvarchar](50) NULL,
          [HinhAnh] [varchar](255) NULL,
          [GiaThue] [decimal](18, 2) NOT NULL,
          [MaLoaiSan] [int] NOT NULL,
          [TrangThai] [nvarchar](50) NOT NULL DEFAULT (N'Hoạt động'),
          PRIMARY KEY CLUSTERED ([MaSan] ASC)
        )`,
      LichSan: `
        CREATE TABLE [dbo].[LichSan](
          [MaLichSan] [int] IDENTITY(1,1) NOT NULL,
          [MaSan] [int] NOT NULL,
          [NgayApDung] [date] NOT NULL,
          [GioBatDau] [time](7) NOT NULL,
          [GioKetThuc] [time](7) NOT NULL,
          PRIMARY KEY CLUSTERED ([MaLichSan] ASC)
        )`,
      DatSan: `
        CREATE TABLE [dbo].[DatSan](
          [MaDatSan] [int] IDENTITY(1,1) NOT NULL,
          [UserID] [int] NOT NULL,
          [MaLichSan] [int] NOT NULL,
          [NgayDat] [datetime] NOT NULL DEFAULT (getdate()),
          [TongTien] [decimal](18, 2) NULL,
          [TrangThai] [nvarchar](50) NOT NULL DEFAULT (N'Chờ duyệt'),
          [NguoiDuyet] [int] NULL,
          PRIMARY KEY CLUSTERED ([MaDatSan] ASC)
        )`,
      ChiTietDatSan: `
        CREATE TABLE [dbo].[ChiTietDatSan](
          [MaChiTiet] [int] IDENTITY(1,1) NOT NULL,
          [MaDatSan] [int] NOT NULL,
          [GiaTheoGio] [decimal](18, 2) NOT NULL,
          PRIMARY KEY CLUSTERED ([MaChiTiet] ASC)
        )`,
      ThanhToan: `
        CREATE TABLE [dbo].[ThanhToan](
          [MaThanhToan] [int] IDENTITY(1,1) NOT NULL,
          [MaDatSan] [int] NOT NULL,
          [PhuongThuc] [bit] NULL,
          [ThoiGianThanhToan] [datetime] NULL,
          [TrangThaiThanhToan] [bit] NULL DEFAULT ((0)),
          [NhanVienKiemTra] [int] NULL,
          PRIMARY KEY CLUSTERED ([MaThanhToan] ASC)
        )`,
      VeDienTu: `
        CREATE TABLE [dbo].[VeDienTu](
          [MaVe] [varchar](12) NOT NULL,
          [MaDatSan] [int] NOT NULL,
          [QRCode] [nvarchar](255) NOT NULL,
          [ThoiGianCheckIn] [datetime] NULL,
          [ThoiGianCheckOut] [datetime] NULL,
          PRIMARY KEY CLUSTERED ([MaVe] ASC)
        )`,
      LichSuDiem: `
        CREATE TABLE [dbo].[LichSuDiem](
          [MaCapNhat] [int] IDENTITY(1,1) NOT NULL,
          [UserID] [int] NOT NULL,
          [ThoiGianCapNhat] [datetime] NULL,
          [DiemThayDoi] [int] NOT NULL,
          [GhiChu] [nvarchar](500) NULL,
          PRIMARY KEY CLUSTERED ([MaCapNhat] ASC)
        )`,
      OtpKhoiPhucMatKhau: `
        CREATE TABLE [dbo].[OtpKhoiPhucMatKhau](
          [Id] [int] IDENTITY(1,1) NOT NULL,
          [Email] [nvarchar](80) NOT NULL,
          [Otp] [varchar](6) NOT NULL,
          [ExpiresAt] [datetime] NOT NULL,
          [IsUsed] [bit] NOT NULL DEFAULT (0),
          [CreatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
          PRIMARY KEY CLUSTERED ([Id] ASC)
        )`,
    };

    // Create missing tables
    for (const table of missingTables) {
      if (createStatements[table]) {
        console.log(`Creating table [${table}]...`);
        await pool.request().query(createStatements[table]);
        console.log(`  ✓ Created [${table}]`);
      }
    }

    // Add unique constraints and indexes for newly created tables
    const constraints = [];

    if (missingTables.includes('NguoiDung')) {
      constraints.push(
        `ALTER TABLE [dbo].[NguoiDung] ADD UNIQUE NONCLUSTERED ([Username] ASC)`,
        `ALTER TABLE [dbo].[NguoiDung] ADD UNIQUE NONCLUSTERED ([EmailTruong] ASC)`,
        `ALTER TABLE [dbo].[NguoiDung] ADD UNIQUE NONCLUSTERED ([EmailCaNhan] ASC)`,
      );
    }
    if (missingTables.includes('DatSan')) {
      constraints.push(
        `ALTER TABLE [dbo].[DatSan] ADD UNIQUE NONCLUSTERED ([MaLichSan] ASC)`,
      );
    }
    if (missingTables.includes('LichSan')) {
      constraints.push(
        `ALTER TABLE [dbo].[LichSan] ADD CONSTRAINT [UQ_LichSan] UNIQUE NONCLUSTERED ([MaSan] ASC, [NgayApDung] ASC, [GioBatDau] ASC, [GioKetThuc] ASC)`,
      );
    }
    if (missingTables.includes('VaiTro')) {
      constraints.push(
        `ALTER TABLE [dbo].[VaiTro] ADD UNIQUE NONCLUSTERED ([TenVaiTro] ASC)`,
      );
    }
    if (missingTables.includes('ThanhToan')) {
      constraints.push(
        `ALTER TABLE [dbo].[ThanhToan] ADD UNIQUE NONCLUSTERED ([MaDatSan] ASC)`,
      );
    }

    for (const c of constraints) {
      try {
        await pool.request().query(c);
        console.log(`  ✓ Constraint added`);
      } catch (e) {
        console.log(`  ⚠ Constraint skipped: ${e.message.slice(0, 80)}`);
      }
    }

    // Add foreign keys (only if both tables exist now)
    const fks = [
      { sql: `ALTER TABLE [dbo].[NguoiDung] WITH CHECK ADD CONSTRAINT [FK_NguoiDung_VaiTro] FOREIGN KEY([MaVaiTro]) REFERENCES [dbo].[VaiTro] ([MaVaiTro])`, deps: ['NguoiDung', 'VaiTro'] },
      { sql: `ALTER TABLE [dbo].[SanBai] WITH CHECK ADD FOREIGN KEY([MaLoaiSan]) REFERENCES [dbo].[LoaiSan] ([MaLoaiSan])`, deps: ['SanBai', 'LoaiSan'] },
      { sql: `ALTER TABLE [dbo].[LichSan] WITH CHECK ADD CONSTRAINT [FK_LichSan_SanBai] FOREIGN KEY([MaSan]) REFERENCES [dbo].[SanBai] ([MaSan])`, deps: ['LichSan', 'SanBai'] },
      { sql: `ALTER TABLE [dbo].[DatSan] WITH CHECK ADD CONSTRAINT [FK_DatSan_User] FOREIGN KEY([UserID]) REFERENCES [dbo].[NguoiDung] ([UserID])`, deps: ['DatSan', 'NguoiDung'] },
      { sql: `ALTER TABLE [dbo].[DatSan] WITH CHECK ADD CONSTRAINT [FK_DatSan_LichSan] FOREIGN KEY([MaLichSan]) REFERENCES [dbo].[LichSan] ([MaLichSan])`, deps: ['DatSan', 'LichSan'] },
      { sql: `ALTER TABLE [dbo].[DatSan] WITH CHECK ADD CONSTRAINT [FK_DatSan_NguoiDuyet] FOREIGN KEY([NguoiDuyet]) REFERENCES [dbo].[NguoiDung] ([UserID])`, deps: ['DatSan', 'NguoiDung'] },
      { sql: `ALTER TABLE [dbo].[ChiTietDatSan] WITH CHECK ADD CONSTRAINT [FK_ChiTietDatSan_DatSan] FOREIGN KEY([MaDatSan]) REFERENCES [dbo].[DatSan] ([MaDatSan])`, deps: ['ChiTietDatSan', 'DatSan'] },
      { sql: `ALTER TABLE [dbo].[ThanhToan] WITH CHECK ADD CONSTRAINT [FK_ThanhToan_DatSan] FOREIGN KEY([MaDatSan]) REFERENCES [dbo].[DatSan] ([MaDatSan])`, deps: ['ThanhToan', 'DatSan'] },
      { sql: `ALTER TABLE [dbo].[LichSuDiem] WITH CHECK ADD CONSTRAINT [FK_LSD_NguoiDung] FOREIGN KEY([UserID]) REFERENCES [dbo].[NguoiDung] ([UserID])`, deps: ['LichSuDiem', 'NguoiDung'] },
    ];

    console.log('\nAdding foreign keys...');
    for (const fk of fks) {
      try {
        await pool.request().query(fk.sql);
        console.log(`  ✓ FK added`);
      } catch (e) {
        console.log(`  ⚠ FK skipped: ${e.message.slice(0, 80)}`);
      }
    }

    // Seed data for missing tables
    console.log('\nSeeding data...');

    if (missingTables.includes('VaiTro')) {
      console.log('  Seeding VaiTro...');
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[VaiTro] ON`);
      await pool.request().query(`INSERT [dbo].[VaiTro] ([MaVaiTro], [TenVaiTro]) VALUES (1, N'Admin')`);
      await pool.request().query(`INSERT [dbo].[VaiTro] ([MaVaiTro], [TenVaiTro]) VALUES (2, N'Sinh viên')`);
      await pool.request().query(`INSERT [dbo].[VaiTro] ([MaVaiTro], [TenVaiTro]) VALUES (3, N'Nhân viên trực sân')`);
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[VaiTro] OFF`);
      console.log('  ✓ VaiTro seeded');
    }

    if (missingTables.includes('LoaiSan')) {
      console.log('  Seeding LoaiSan...');
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[LoaiSan] ON`);
      await pool.request().query(`INSERT [dbo].[LoaiSan] ([MaLoaiSan], [TenLoaiSan]) VALUES (1, N'Cầu lông-Pickleball-Tennis')`);
      await pool.request().query(`INSERT [dbo].[LoaiSan] ([MaLoaiSan], [TenLoaiSan]) VALUES (2, N'Bóng đá')`);
      await pool.request().query(`INSERT [dbo].[LoaiSan] ([MaLoaiSan], [TenLoaiSan]) VALUES (3, N'Bóng rổ')`);
      await pool.request().query(`INSERT [dbo].[LoaiSan] ([MaLoaiSan], [TenLoaiSan]) VALUES (4, N'Bóng chuyền')`);
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[LoaiSan] OFF`);
      console.log('  ✓ LoaiSan seeded');
    }

    if (missingTables.includes('NguoiDung')) {
      console.log('  Seeding NguoiDung...');
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[NguoiDung] ON`);
      const users = [
        [1, "sv1", "123456", "231121521228", "49K21.2", "Nguyễn Văn An", "0905123456", "231121521228@due.udn.vn", "an@gmail.com", null, 0, 40, 2],
        [2, "sv2", "123456", "231121521229", "49K21.2", "Trần Thị Bình", "0905234567", "231121521229@due.udn.vn", "binh@gmail.com", null, 1, 100, 2],
        [3, "sv3", "123456", "231121521230", "49K21.2", "Lê Văn Cường", "0905345678", "231121521230@due.udn.vn", "cuong@gmail.com", null, 1, 100, 2],
        [4, "sv4", "123456", "231121521231", "49K21.2", "Phạm Thị Dung", "0905456789", "231121521231@due.udn.vn", "dung@gmail.com", null, 1, 100, 2],
        [5, "sv5", "123456", "231121521232", "49K21.2", "Hoàng Văn Đức", "0905567890", "231121521232@due.udn.vn", "duc@gmail.com", null, 1, 100, 2],
        [6, "sv6", "123456", "231121521233", "49K21.2", "Đặng Thị Hạnh", "0905678901", "231121521233@due.udn.vn", "hanh@gmail.com", null, 1, 100, 2],
        [7, "admin", "$2b$10$H6wjL8TnFObz75N8sHJ6uePv91MkTXJ687QqePKQQrYKNJVeMkmFy", null, null, "Quản Trị Hệ Thống", "0912345678", "admin@due.udn.vn", "admin@gmail.com", null, 1, 100, 1],
        [8, "nv1", "123456", null, null, "Nguyễn Văn Hùng", "0913456789", "nv1@due.udn.vn", "hung@gmail.com", null, 1, 100, 3],
        [9, "nv2", "123456", null, null, "Lê Thị Lan", "0914567890", "nv2@due.udn.vn", "lan@gmail.com", null, 1, 100, 3],
        [10, "nv3", "123456", null, null, "Trần Văn Minh", "0915678901", "nv3@due.udn.vn", "minh@gmail.com", null, 1, 100, 3],
      ];
      for (const u of users) {
        const req = pool.request();
        req.input('uid', sql.Int, u[0]);
        req.input('username', sql.NVarChar(50), u[1]);
        req.input('matkhau', sql.NVarChar(255), u[2]);
        req.input('msv', sql.VarChar(12), u[3]);
        req.input('lop', sql.VarChar(10), u[4]);
        req.input('hoten', sql.NVarChar(100), u[5]);
        req.input('sdt', sql.VarChar(10), u[6]);
        req.input('emailtruong', sql.VarChar(80), u[7]);
        req.input('emailcanhan', sql.VarChar(80), u[8]);
        req.input('anhdaidien', sql.NVarChar(255), u[9]);
        req.input('trangthai', sql.Bit, u[10]);
        req.input('diemuytin', sql.Int, u[11]);
        req.input('mavaitro', sql.Int, u[12]);
        await req.query(`INSERT [dbo].[NguoiDung] ([UserID],[Username],[MatKhau],[MSV],[Lop],[HoTen],[SDT],[EmailTruong],[EmailCaNhan],[AnhDaiDien],[TrangThai],[DiemUyTin],[MaVaiTro]) VALUES (@uid,@username,@matkhau,@msv,@lop,@hoten,@sdt,@emailtruong,@emailcanhan,@anhdaidien,@trangthai,@diemuytin,@mavaitro)`);
      }
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[NguoiDung] OFF`);
      console.log('  ✓ NguoiDung seeded (10 users including admin)');
    }

    if (missingTables.includes('SanBai')) {
      console.log('  Seeding SanBai...');
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[SanBai] ON`);
      await pool.request().query(`INSERT [dbo].[SanBai] ([MaSan],[TenSan],[ViTri],[HinhAnh],[GiaThue],[MaLoaiSan],[TrangThai]) VALUES (1,N'Sân Cầu Lông 1',N'Trong nhà',NULL,80000,1,N'Hoạt động')`);
      await pool.request().query(`INSERT [dbo].[SanBai] ([MaSan],[TenSan],[ViTri],[HinhAnh],[GiaThue],[MaLoaiSan],[TrangThai]) VALUES (2,N'Sân Cầu Lông 2',N'Ngoài trời',NULL,80000,1,N'Hoạt động')`);
      await pool.request().query(`INSERT [dbo].[SanBai] ([MaSan],[TenSan],[ViTri],[HinhAnh],[GiaThue],[MaLoaiSan],[TrangThai]) VALUES (3,N'Sân Bóng Rổ',N'Ngoài trời',NULL,80000,3,N'Hoạt động')`);
      await pool.request().query(`INSERT [dbo].[SanBai] ([MaSan],[TenSan],[ViTri],[HinhAnh],[GiaThue],[MaLoaiSan],[TrangThai]) VALUES (4,N'Sân Bóng Chuyền',N'Ngoài trời',NULL,80000,4,N'Hoạt động')`);
      await pool.request().query(`INSERT [dbo].[SanBai] ([MaSan],[TenSan],[ViTri],[HinhAnh],[GiaThue],[MaLoaiSan],[TrangThai]) VALUES (5,N'Sân Bóng Đá 1',N'Ngoài trời',NULL,200000,2,N'Hoạt động')`);
      await pool.request().query(`INSERT [dbo].[SanBai] ([MaSan],[TenSan],[ViTri],[HinhAnh],[GiaThue],[MaLoaiSan],[TrangThai]) VALUES (6,N'Sân Bóng Đá 2',N'Ngoài trời',NULL,200000,2,N'Hoạt động')`);
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[SanBai] OFF`);
      console.log('  ✓ SanBai seeded');
    }

    if (missingTables.includes('LichSan')) {
      console.log('  Seeding LichSan...');
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[LichSan] ON`);
      const lichSanData = [
        [1,1,'2026-03-10','05:30:00','06:30:00'],[2,1,'2026-03-10','16:30:00','17:30:00'],
        [3,1,'2026-03-10','17:30:00','19:30:00'],[4,1,'2026-03-10','19:30:00','21:00:00'],
        [5,2,'2026-03-10','05:30:00','06:30:00'],[6,2,'2026-03-10','16:30:00','17:30:00'],
        [7,2,'2026-03-10','17:30:00','19:30:00'],[8,2,'2026-03-10','19:30:00','21:00:00'],
        [9,3,'2026-03-10','05:30:00','06:30:00'],[10,3,'2026-03-10','16:30:00','17:30:00'],
        [11,3,'2026-03-10','17:30:00','19:30:00'],[12,3,'2026-03-10','19:30:00','21:00:00'],
        [13,4,'2026-03-10','05:30:00','06:30:00'],[14,4,'2026-03-10','16:30:00','17:30:00'],
        [15,4,'2026-03-10','17:30:00','19:30:00'],[16,4,'2026-03-10','19:30:00','21:00:00'],
        [17,5,'2026-03-10','05:30:00','06:30:00'],[18,5,'2026-03-10','16:30:00','17:30:00'],
        [19,5,'2026-03-10','17:30:00','19:30:00'],[20,5,'2026-03-10','19:30:00','21:00:00'],
        [21,6,'2026-03-10','05:30:00','06:30:00'],[22,6,'2026-03-10','16:30:00','17:30:00'],
        [23,6,'2026-03-10','17:30:00','19:30:00'],[24,6,'2026-03-10','19:30:00','21:00:00'],
        [25,1,'2026-03-15','06:00:00','08:00:00'],[26,1,'2026-03-15','08:00:00','10:00:00'],
        [27,1,'2026-03-15','10:00:00','12:00:00'],[28,1,'2026-03-15','14:00:00','16:00:00'],
        [29,1,'2026-03-15','16:00:00','18:00:00'],[30,1,'2026-03-15','18:00:00','20:00:00'],
        [31,1,'2026-03-30','08:00:00','10:00:00'],[32,1,'2026-03-30','10:00:00','12:00:00'],
        [33,2,'2026-03-30','08:00:00','10:00:00'],
      ];
      for (const r of lichSanData) {
        const req = pool.request();
        req.input('id', sql.Int, r[0]);
        req.input('maSan', sql.Int, r[1]);
        req.input('ngay', sql.Date, r[2]);
        req.input('bd', sql.NVarChar(8), r[3]);
        req.input('kt', sql.NVarChar(8), r[4]);
        await req.query(`INSERT [dbo].[LichSan] ([MaLichSan],[MaSan],[NgayApDung],[GioBatDau],[GioKetThuc]) VALUES (@id,@maSan,@ngay,@bd,@kt)`);
      }
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[LichSan] OFF`);
      console.log('  ✓ LichSan seeded');
    }

    if (missingTables.includes('DatSan')) {
      console.log('  Seeding DatSan...');
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[DatSan] ON`);
      const datSanData = [
        [1,1,1,'2026-03-12T00:05:23.383',80000,'Đã duyệt',7],
        [2,2,2,'2026-03-12T00:05:23.383',80000,'Đã thanh toán',7],
        [3,3,3,'2026-03-12T00:05:23.383',80000,'Đã check-in',7],
        [4,4,4,'2026-03-12T00:05:23.383',80000,'Hoàn thành',7],
        [5,5,5,'2026-03-12T00:05:23.383',80000,'Chờ duyệt',null],
        [6,6,6,'2026-03-12T00:05:23.383',80000,'Bị từ chối',7],
        [7,1,7,'2026-03-12T00:05:23.383',100000,'Đã duyệt',7],
        [8,2,8,'2026-03-12T00:05:23.383',100000,'Đã thanh toán',7],
        [9,3,9,'2026-03-12T00:05:23.383',100000,'Đã check-in',7],
        [10,4,10,'2026-03-12T00:05:23.383',100000,'Bị từ chối',1],
        [11,5,11,'2026-03-12T00:05:23.383',120000,'No-show',7],
        [12,6,12,'2026-03-12T00:05:23.383',120000,'Đã hủy',null],
        [13,1,13,'2026-03-12T00:05:23.383',200000,'Đã duyệt',7],
        [14,2,14,'2026-03-12T00:05:23.383',200000,'Đã thanh toán',7],
        [15,3,15,'2026-03-12T00:05:23.383',200000,'Đã check-in',7],
        [16,4,16,'2026-03-12T00:05:23.383',200000,'Hoàn thành',7],
        [17,5,17,'2026-03-12T00:05:23.383',150000,'Chờ duyệt',null],
        [18,6,18,'2026-03-12T00:05:23.383',150000,'Đã duyệt',7],
        [19,1,19,'2026-03-12T00:05:23.383',150000,'Đã thanh toán',7],
        [20,2,20,'2026-03-12T00:05:23.383',150000,'Đã check-in',7],
      ];
      for (const d of datSanData) {
        const req = pool.request();
        req.input('id', sql.Int, d[0]);
        req.input('uid', sql.Int, d[1]);
        req.input('mls', sql.Int, d[2]);
        req.input('nd', sql.DateTime, new Date(d[3]));
        req.input('tt', sql.Decimal(18,2), d[4]);
        req.input('st', sql.NVarChar(50), d[5]);
        req.input('duyet', sql.Int, d[6]);
        await req.query(`INSERT [dbo].[DatSan] ([MaDatSan],[UserID],[MaLichSan],[NgayDat],[TongTien],[TrangThai],[NguoiDuyet]) VALUES (@id,@uid,@mls,@nd,@tt,@st,@duyet)`);
      }
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[DatSan] OFF`);
      console.log('  ✓ DatSan seeded');
    }

    if (missingTables.includes('VeDienTu')) {
      console.log('  Seeding VeDienTu...');
      const veData = [
        ['VE000000001',1,'QR_1',null,null],['VE000000002',2,'QR_2',null,null],
        ['VE000000003',3,'QR_3','2026-03-12T00:08:46.527',null],
        ['VE000000004',4,'QR_4','2026-03-12T00:08:46.527','2026-03-12T01:08:46.527'],
        ['VE000000005',5,'QR_5',null,null],['VE000000006',6,'QR_6',null,null],
        ['VE000000007',7,'QR_7',null,null],['VE000000008',8,'QR_8',null,null],
        ['VE000000009',9,'QR_9','2026-03-12T00:08:46.527',null],
        ['VE000000010',10,'QR_10','2026-03-12T00:08:46.527','2026-03-12T01:08:46.527'],
        ['VE000000011',11,'QR_11',null,null],['VE000000012',12,'QR_12',null,null],
        ['VE000000013',13,'QR_13',null,null],['VE000000014',14,'QR_14',null,null],
        ['VE000000015',15,'QR_15','2026-03-12T00:08:46.527',null],
        ['VE000000016',16,'QR_16','2026-03-12T00:08:46.527','2026-03-12T01:08:46.527'],
        ['VE000000017',17,'QR_17',null,null],['VE000000018',18,'QR_18',null,null],
        ['VE000000019',19,'QR_19',null,null],
        ['VE000000020',20,'QR_20','2026-03-12T00:08:46.527',null],
      ];
      for (const v of veData) {
        const req = pool.request();
        req.input('mv', sql.VarChar(12), v[0]);
        req.input('mds', sql.Int, v[1]);
        req.input('qr', sql.NVarChar(255), v[2]);
        req.input('ci', sql.DateTime, v[3] ? new Date(v[3]) : null);
        req.input('co', sql.DateTime, v[4] ? new Date(v[4]) : null);
        await req.query(`INSERT [dbo].[VeDienTu] ([MaVe],[MaDatSan],[QRCode],[ThoiGianCheckIn],[ThoiGianCheckOut]) VALUES (@mv,@mds,@qr,@ci,@co)`);
      }
      console.log('  ✓ VeDienTu seeded');
    }

    if (missingTables.includes('ThanhToan')) {
      console.log('  Seeding ThanhToan...');
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[ThanhToan] ON`);
      const ttData = [
        [1,1,null,null,0,null],[2,2,1,'2026-03-12T00:14:25.660',1,8],
        [3,3,1,'2026-03-12T00:14:25.660',1,9],[4,4,0,'2026-03-12T00:14:25.660',1,8],
        [5,5,null,null,0,null],[6,6,null,null,0,null],
        [7,7,1,'2026-03-12T00:14:25.660',1,9],[8,8,0,'2026-03-12T00:14:25.660',1,8],
        [9,9,1,'2026-03-12T00:14:25.660',1,9],[10,10,0,'2026-03-12T00:14:25.660',1,10],
        [11,11,1,'2026-03-12T00:14:25.660',1,8],[12,12,null,null,0,null],
        [13,13,1,'2026-03-12T00:14:25.660',1,10],[14,14,1,'2026-03-12T00:14:25.660',1,9],
        [15,15,0,'2026-03-12T00:14:25.660',1,8],[16,16,0,'2026-03-12T00:14:25.660',1,9],
        [17,17,null,null,0,null],[18,18,1,'2026-03-12T00:14:25.660',1,8],
        [19,19,1,'2026-03-12T00:14:25.660',1,9],[20,20,0,'2026-03-12T00:14:25.660',1,10],
      ];
      for (const t of ttData) {
        const req = pool.request();
        req.input('id', sql.Int, t[0]);
        req.input('mds', sql.Int, t[1]);
        req.input('pt', sql.Bit, t[2]);
        req.input('tg', sql.DateTime, t[3] ? new Date(t[3]) : null);
        req.input('tttt', sql.Bit, t[4]);
        req.input('nv', sql.Int, t[5]);
        await req.query(`INSERT [dbo].[ThanhToan] ([MaThanhToan],[MaDatSan],[PhuongThuc],[ThoiGianThanhToan],[TrangThaiThanhToan],[NhanVienKiemTra]) VALUES (@id,@mds,@pt,@tg,@tttt,@nv)`);
      }
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[ThanhToan] OFF`);
      console.log('  ✓ ThanhToan seeded');
    }

    if (missingTables.includes('ChiTietDatSan')) {
      console.log('  Seeding ChiTietDatSan...');
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[ChiTietDatSan] ON`);
      const ctData = [
        [1,1,80000],[2,2,80000],[3,3,80000],[4,4,80000],[5,5,80000],[6,6,80000],
        [7,7,100000],[8,8,100000],[9,9,100000],[10,10,100000],
        [11,11,120000],[12,12,120000],
        [13,13,200000],[14,14,200000],[15,15,200000],[16,16,200000],
        [17,17,150000],[18,18,150000],[19,19,150000],[20,20,150000],
      ];
      for (const c of ctData) {
        const req = pool.request();
        req.input('id', sql.Int, c[0]);
        req.input('mds', sql.Int, c[1]);
        req.input('gia', sql.Decimal(18,2), c[2]);
        await req.query(`INSERT [dbo].[ChiTietDatSan] ([MaChiTiet],[MaDatSan],[GiaTheoGio]) VALUES (@id,@mds,@gia)`);
      }
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[ChiTietDatSan] OFF`);
      console.log('  ✓ ChiTietDatSan seeded');
    }

    if (missingTables.includes('LichSuDiem')) {
      console.log('  Seeding LichSuDiem...');
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[LichSuDiem] ON`);
      const lsdData = [
        [1,4,'2026-03-12T00:13:00.790',5,'Hoàn thành đặt sân #4'],
        [2,4,'2026-03-12T00:13:00.790',5,'Hoàn thành đặt sân #10'],
        [3,4,'2026-03-12T00:13:00.790',5,'Hoàn thành đặt sân #16'],
        [4,3,'2026-03-12T00:13:00.790',2,'Check-in trễ đặt sân #3'],
        [5,3,'2026-03-12T00:13:00.790',2,'Check-in trễ đặt sân #9'],
        [6,3,'2026-03-12T00:13:00.790',2,'Check-in trễ đặt sân #15'],
        [7,2,'2026-03-12T00:13:00.790',2,'Check-in trễ đặt sân #20'],
        [8,5,'2026-03-12T00:13:00.790',-5,'No-show đặt sân #11'],
        [9,6,'2026-03-12T00:13:00.790',-10,'Đã hủy đặt sân #12'],
      ];
      for (const l of lsdData) {
        const req = pool.request();
        req.input('id', sql.Int, l[0]);
        req.input('uid', sql.Int, l[1]);
        req.input('tg', sql.DateTime, new Date(l[2]));
        req.input('dtd', sql.Int, l[3]);
        req.input('gc', sql.NVarChar(500), l[4]);
        await req.query(`INSERT [dbo].[LichSuDiem] ([MaCapNhat],[UserID],[ThoiGianCapNhat],[DiemThayDoi],[GhiChu]) VALUES (@id,@uid,@tg,@dtd,@gc)`);
      }
      await pool.request().query(`SET IDENTITY_INSERT [dbo].[LichSuDiem] OFF`);
      console.log('  ✓ LichSuDiem seeded');
    }

    // Final verification
    console.log('\n========== VERIFICATION ==========');
    const finalTables = await pool.request().query(`
      SELECT TABLE_NAME, (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS c WHERE c.TABLE_NAME = t.TABLE_NAME) as ColCount
      FROM INFORMATION_SCHEMA.TABLES t WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME
    `);
    for (const r of finalTables.recordset) {
      const countResult = await pool.request().query(`SELECT COUNT(*) as cnt FROM [${r.TABLE_NAME}]`);
      console.log(`  [${r.TABLE_NAME}] - ${countResult.recordset[0].cnt} rows`);
    }
    console.log('\n✅ Database setup complete!');

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
