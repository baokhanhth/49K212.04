import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QuerySanBaiDto {
  @ApiPropertyOptional({ description: 'Tìm theo tên sân', example: 'Sân A' })
  @IsOptional()
  @IsString()
  tenSan?: string;

  @ApiPropertyOptional({ description: 'Lọc theo mã loại sân', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maLoaiSan?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái',
    example: 'Hoạt động',
    enum: ['Hoạt động', 'Bảo trì', 'Ngừng hoạt động'],
  })
  @IsOptional()
  @IsString()
  trangThai?: string;
}
