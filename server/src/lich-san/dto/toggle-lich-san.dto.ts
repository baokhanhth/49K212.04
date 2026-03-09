import {
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TimeRangeDto } from './time-range.dto';

export class ToggleLichSanDto {
  @ApiProperty({ description: 'Mã sân', example: 1 })
  @IsNotEmpty({ message: 'Mã sân không được để trống' })
  @IsInt({ message: 'Mã sân phải là số nguyên' })
  maSan: number;

  @ApiProperty({ description: 'Ngày áp dụng (YYYY-MM-DD)', example: '2026-03-25' })
  @IsNotEmpty({ message: 'Ngày áp dụng không được để trống' })
  @IsDateString({}, { message: 'Ngày áp dụng phải có định dạng YYYY-MM-DD' })
  ngayApDung: string;

  @ApiProperty({
    description: 'Danh sách khung giờ cần đóng/mở',
    type: [TimeRangeDto],
    example: [
      { gioBatDau: '06:00:00', gioKetThuc: '08:00:00' },
      { gioBatDau: '08:00:00', gioKetThuc: '10:00:00' },
    ],
  })
  @IsArray({ message: 'Danh sách khung giờ phải là mảng' })
  @ArrayNotEmpty({ message: 'Danh sách khung giờ không được rỗng' })
  @ValidateNested({ each: true })
  @Type(() => TimeRangeDto)
  danhSachKhungGio: TimeRangeDto[];

  @ApiProperty({
    description: 'true = mở (tạo lịch sân), false = đóng (xóa lịch sân chưa đặt)',
    example: true,
  })
  @IsNotEmpty({ message: 'Trạng thái mở/đóng không được để trống' })
  @IsBoolean({ message: 'moLich phải là boolean' })
  moLich: boolean;
}
