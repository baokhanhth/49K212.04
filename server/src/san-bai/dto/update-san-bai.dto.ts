import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateSanBaiDto {
  @ApiPropertyOptional({ description: 'Tên sân', example: 'Sân A' })
  @IsOptional()
  @IsString()
  tenSan?: string;

  @ApiPropertyOptional({ description: 'Mã loại sân', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Mã loại sân phải là số' })
  maLoaiSan?: number;

  @ApiPropertyOptional({ description: 'Giá thuê mỗi khung giờ (VNĐ)', example: 200000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Đơn giá phải là số' })
  @Min(1, { message: 'Giá không được nhỏ hơn hoặc bằng 0' })
  giaThue?: number;

  @ApiPropertyOptional({ description: 'Số ngày cho phép đặt trước', example: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số ngày đặt trước phải là số' })
  @Min(1, { message: 'Số ngày đặt trước phải >= 1' })
  soNgayDatTruoc?: number;

  @ApiPropertyOptional({ description: 'Vị trí sân', example: 'Khu A' })
  @IsOptional()
  @IsString()
  viTri?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái sân',
    example: 'Hoạt động',
    enum: ['Hoạt động', 'Bảo trì', 'Không hoạt động'],
  })
  @IsOptional()
  @IsIn(['Hoạt động', 'Bảo trì', 'Không hoạt động'], {
    message: "Trạng thái phải là 'Hoạt động', 'Bảo trì' hoặc 'Không hoạt động'",
  })
  trangThai?: string;
}
