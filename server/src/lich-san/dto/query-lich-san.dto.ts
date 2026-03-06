import { IsOptional, IsInt, IsDateString } from 'class-validator';
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

  @ApiPropertyOptional({ description: 'Lọc theo mã khung giờ', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maKhungGio?: number;

  @ApiPropertyOptional({
    description: 'Lọc trạng thái: "trong" = chỉ lịch trống, "da_dat" = chỉ lịch đã đặt, bỏ trống = tất cả',
    enum: ['trong', 'da_dat'],
    example: 'trong',
  })
  @IsOptional()
  trangThai?: string;
}
