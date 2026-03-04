-- =============================================
-- Migration: Cập nhật DB cho US-18, US-20
-- Date: 2026-03-04
-- =============================================

USE [QuanLyDatSan]
GO

-- 1. Thêm cột BiKhoa và LyDoKhoa vào bảng LichSan (US-20)
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_NAME = 'LichSan' AND COLUMN_NAME = 'BiKhoa'
)
BEGIN
  ALTER TABLE [dbo].[LichSan] ADD [BiKhoa] [bit] NOT NULL DEFAULT (0);
  PRINT N'Đã thêm cột BiKhoa vào bảng LichSan';
END
GO

IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_NAME = 'LichSan' AND COLUMN_NAME = 'LyDoKhoa'
)
BEGIN
  ALTER TABLE [dbo].[LichSan] ADD [LyDoKhoa] [nvarchar](500) NULL;
  PRINT N'Đã thêm cột LyDoKhoa vào bảng LichSan';
END
GO

-- 2. Tạo bảng CauHinhHeThong (US-20 cấu hình số ngày đặt trước)
IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
  WHERE TABLE_NAME = 'CauHinhHeThong'
)
BEGIN
  CREATE TABLE [dbo].[CauHinhHeThong](
    [MaCauHinh] [int] IDENTITY(1,1) NOT NULL,
    [TenCauHinh] [nvarchar](100) NOT NULL,
    [GiaTri] [nvarchar](255) NOT NULL,
    [MoTa] [nvarchar](500) NULL,
    PRIMARY KEY CLUSTERED ([MaCauHinh] ASC)
  ) ON [PRIMARY];

  -- Thêm UNIQUE cho TenCauHinh
  ALTER TABLE [dbo].[CauHinhHeThong] ADD CONSTRAINT [UQ_CauHinh_TenCauHinh] 
    UNIQUE NONCLUSTERED ([TenCauHinh] ASC);

  PRINT N'Đã tạo bảng CauHinhHeThong';
END
GO

-- 3. Thêm dữ liệu mặc định cho CauHinhHeThong
IF NOT EXISTS (
  SELECT 1 FROM [dbo].[CauHinhHeThong] 
  WHERE [TenCauHinh] = 'SO_NGAY_DAT_TRUOC'
)
BEGIN
  INSERT INTO [dbo].[CauHinhHeThong] ([TenCauHinh], [GiaTri], [MoTa])
  VALUES (
    N'SO_NGAY_DAT_TRUOC', 
    N'7', 
    N'Số ngày tối đa cho phép đặt trước sân (tính từ hôm nay)'
  );
  PRINT N'Đã thêm cấu hình SO_NGAY_DAT_TRUOC mặc định = 7';
END
GO

PRINT N'Migration hoàn tất!';
GO
