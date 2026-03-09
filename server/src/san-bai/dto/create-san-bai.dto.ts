import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSanBaiDto {
  @ApiProperty({ description: 'Tên sân', example: 'Sân A' })
  @IsNotEmpty({ message: 'Tên sân không được để trống' })
  @IsString()
  tenSan: string;

  @ApiProperty({ description: 'Mã loại sân', example: 1 })
  @IsNotEmpty({ message: 'Loại sân không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Mã loại sân phải là số' })
  maLoaiSan: number;

  @ApiProperty({ description: 'Giá thuê mỗi khung giờ (VNĐ)', example: 200000 })
  @IsNotEmpty({ message: 'Đơn giá không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Đơn giá phải là số' })
  @Min(1, { message: 'Giá không được nhỏ hơn hoặc bằng 0' })
  giaThue: number;

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
