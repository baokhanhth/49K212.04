import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDatSanDto {
  @ApiPropertyOptional({ description: 'Lọc theo trạng thái (Chờ duyệt, Đã duyệt, Từ chối)', example: 'Chờ duyệt' })
  @IsOptional()
  @IsString()
  trangThai?: string;

  @ApiPropertyOptional({ description: 'Lọc theo mã sân', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maSan?: number;

  @ApiPropertyOptional({ description: 'Lọc theo ngày (YYYY-MM-DD)', example: '2026-03-15' })
  @IsOptional()
  @IsString()
  ngay?: string;
}
