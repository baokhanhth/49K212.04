import { DataSource } from 'typeorm';

/**
 * Run all pending table creation + seed data.
 * Called from main.ts before app.listen().
 */
export async function runMigrations(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();

  try {
    // Check which tables exist
    const tables = await queryRunner.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    const existing = new Set(tables.map((r: any) => r.TABLE_NAME));
    console.log('[Migration] Existing tables:', [...existing].join(', '));

    // VaiTro
    if (!existing.has('VaiTro')) {
      console.log('[Migration] Creating VaiTro...');
      await queryRunner.query(`
        CREATE TABLE [dbo].[VaiTro](
          [MaVaiTro] [int] IDENTITY(1,1) NOT NULL,
          [TenVaiTro] [nvarchar](50) NOT NULL,
          PRIMARY KEY CLUSTERED ([MaVaiTro] ASC)
        )`);
      await queryRunner.query(`ALTER TABLE [dbo].[VaiTro] ADD UNIQUE NONCLUSTERED ([TenVaiTro] ASC)`);
      await queryRunner.query(`SET IDENTITY_INSERT [dbo].[VaiTro] ON`);
      await queryRunner.query(`INSERT [dbo].[VaiTro] ([MaVaiTro],[TenVaiTro]) VALUES (1,N'Admin'),(2,N'Sinh viên'),(3,N'Nhân viên trực sân')`);
      await queryRunner.query(`SET IDENTITY_INSERT [dbo].[VaiTro] OFF`);
      console.log('[Migration] ✓ VaiTro created + seeded');
    }

    // NguoiDung
    if (!existing.has('NguoiDung')) {
      console.log('[Migration] Creating NguoiDung...');
      await queryRunner.query(`
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
        )`);
      await queryRunner.query(`ALTER TABLE [dbo].[NguoiDung] ADD UNIQUE NONCLUSTERED ([Username] ASC)`);
      await queryRunner.query(`ALTER TABLE [dbo].[NguoiDung] ADD UNIQUE NONCLUSTERED ([EmailTruong] ASC)`);
      await queryRunner.query(`ALTER TABLE [dbo].[NguoiDung] ADD UNIQUE NONCLUSTERED ([EmailCaNhan] ASC)`);
      await queryRunner.query(`ALTER TABLE [dbo].[NguoiDung] WITH CHECK ADD CONSTRAINT [FK_NguoiDung_VaiTro] FOREIGN KEY([MaVaiTro]) REFERENCES [dbo].[VaiTro]([MaVaiTro])`);

      // Seed users
      await queryRunner.query(`SET IDENTITY_INSERT [dbo].[NguoiDung] ON`);
      await queryRunner.query(`
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
        (10,N'nv3',N'123456',NULL,NULL,N'Trần Văn Minh',N'0915678901',N'nv3@due.udn.vn',N'minh@gmail.com',NULL,1,100,3)
      `);
      await queryRunner.query(`SET IDENTITY_INSERT [dbo].[NguoiDung] OFF`);
      console.log('[Migration] ✓ NguoiDung created + seeded (10 users)');
    }

    // LichSuDiem
    if (!existing.has('LichSuDiem')) {
      console.log('[Migration] Creating LichSuDiem...');
      await queryRunner.query(`
        CREATE TABLE [dbo].[LichSuDiem](
          [MaCapNhat] [int] IDENTITY(1,1) NOT NULL,
          [UserID] [int] NOT NULL,
          [ThoiGianCapNhat] [datetime] NULL,
          [DiemThayDoi] [int] NOT NULL,
          [GhiChu] [nvarchar](500) NULL,
          PRIMARY KEY CLUSTERED ([MaCapNhat] ASC)
        )`);
      await queryRunner.query(`ALTER TABLE [dbo].[LichSuDiem] WITH CHECK ADD CONSTRAINT [FK_LSD_NguoiDung] FOREIGN KEY([UserID]) REFERENCES [dbo].[NguoiDung]([UserID])`);
      
      await queryRunner.query(`SET IDENTITY_INSERT [dbo].[LichSuDiem] ON`);
      await queryRunner.query(`
        INSERT [dbo].[LichSuDiem] ([MaCapNhat],[UserID],[ThoiGianCapNhat],[DiemThayDoi],[GhiChu]) VALUES
        (1,4,'2026-03-12T00:13:00.790',5,N'Hoàn thành đặt sân #4'),
        (2,4,'2026-03-12T00:13:00.790',5,N'Hoàn thành đặt sân #10'),
        (3,4,'2026-03-12T00:13:00.790',5,N'Hoàn thành đặt sân #16'),
        (4,3,'2026-03-12T00:13:00.790',2,N'Check-in trễ đặt sân #3'),
        (5,3,'2026-03-12T00:13:00.790',2,N'Check-in trễ đặt sân #9'),
        (6,3,'2026-03-12T00:13:00.790',2,N'Check-in trễ đặt sân #15'),
        (7,2,'2026-03-12T00:13:00.790',2,N'Check-in trễ đặt sân #20'),
        (8,5,'2026-03-12T00:13:00.790',-5,N'No-show đặt sân #11'),
        (9,6,'2026-03-12T00:13:00.790',-10,N'Đã hủy đặt sân #12')
      `);
      await queryRunner.query(`SET IDENTITY_INSERT [dbo].[LichSuDiem] OFF`);
      console.log('[Migration] ✓ LichSuDiem created + seeded');
    }

    // OtpKhoiPhucMatKhau
    if (!existing.has('OtpKhoiPhucMatKhau')) {
      console.log('[Migration] Creating OtpKhoiPhucMatKhau...');
      await queryRunner.query(`
        CREATE TABLE [dbo].[OtpKhoiPhucMatKhau](
          [Id] [int] IDENTITY(1,1) NOT NULL,
          [Email] [nvarchar](80) NOT NULL,
          [Otp] [varchar](6) NOT NULL,
          [ExpiresAt] [datetime] NOT NULL,
          [IsUsed] [bit] NOT NULL DEFAULT (0),
          [CreatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
          PRIMARY KEY CLUSTERED ([Id] ASC)
        )`);
      console.log('[Migration] ✓ OtpKhoiPhucMatKhau created');
    }

    // ThanhToan
    if (!existing.has('ThanhToan')) {
      console.log('[Migration] Creating ThanhToan...');
      await queryRunner.query(`
        CREATE TABLE [dbo].[ThanhToan](
          [MaThanhToan] [int] IDENTITY(1,1) NOT NULL,
          [MaDatSan] [int] NOT NULL,
          [PhuongThuc] [bit] NULL,
          [ThoiGianThanhToan] [datetime] NULL,
          [TrangThaiThanhToan] [bit] NULL DEFAULT ((0)),
          [NhanVienKiemTra] [int] NULL,
          PRIMARY KEY CLUSTERED ([MaThanhToan] ASC)
        )`);
      await queryRunner.query(`ALTER TABLE [dbo].[ThanhToan] ADD UNIQUE NONCLUSTERED ([MaDatSan] ASC)`);
      console.log('[Migration] ✓ ThanhToan created');
    }

    console.log('[Migration] All migrations complete!');
  } catch (error) {
    console.error('[Migration] ERROR:', error.message);
  } finally {
    await queryRunner.release();
  }
}
