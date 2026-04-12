-- Migration: Thêm cột SoNgayDatTruoc vào bảng SanBai
-- Cho phép cấu hình số ngày đặt trước tối đa cho mỗi sân

IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'SanBai' AND COLUMN_NAME = 'SoNgayDatTruoc'
)
BEGIN
    ALTER TABLE [dbo].[SanBai] 
    ADD [SoNgayDatTruoc] INT NOT NULL DEFAULT 7;
    
    PRINT N'Đã thêm cột SoNgayDatTruoc vào bảng SanBai (mặc định 7 ngày)';
END
ELSE
BEGIN
    PRINT N'Cột SoNgayDatTruoc đã tồn tại';
END
GO
