import { IsOptional, IsInt, IsDateString, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryLichSanDto {
  @ApiPropertyOptional({ description: 'Lọc theo mã sân', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maSan?: number;

  @ApiPropertyOptional({ description: 'Ngày bắt đầu lọc (YYYY-MM-DD)', example: '2026-03-10' })
  @IsOptional()
  @IsDateString()
  tuNgay?: string;

  @ApiPropertyOptional({ description: 'Ngày kết thúc lọc (YYYY-MM-DD)', example: '2026-03-20' })
  @IsOptional()
  @IsDateString()
  denNgay?: string;

  @ApiPropertyOptional({ description: 'Lọc theo giờ bắt đầu', example: '06:00:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'Giờ bắt đầu phải đúng định dạng HH:mm hoặc HH:mm:ss',
  })
  gioBatDau?: string;

  @ApiPropertyOptional({ description: 'Lọc theo giờ kết thúc', example: '08:00:00' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'Giờ kết thúc phải đúng định dạng HH:mm hoặc HH:mm:ss',
  })
  gioKetThuc?: string;

  @ApiPropertyOptional({
    description: 'Lọc trạng thái: "trong" = chỉ lịch trống, "da_dat" = chỉ lịch đã đặt, bỏ trống = tất cả',
    enum: ['trong', 'da_dat'],
    example: 'trong',
  })
  @IsOptional()
  trangThai?: string;
}
