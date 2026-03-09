import {
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TimeRangeDto } from './time-range.dto';

export class GenerateLichSanDto {
  @ApiProperty({ description: 'Mã sân', example: 1 })
  @IsNotEmpty({ message: 'Mã sân không được để trống' })
  @IsInt({ message: 'Mã sân phải là số nguyên' })
  maSan: number;

  @ApiProperty({ description: 'Ngày bắt đầu (YYYY-MM-DD)', example: '2026-03-10' })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @IsDateString({}, { message: 'Ngày bắt đầu phải có định dạng YYYY-MM-DD' })
  tuNgay: string;

  @ApiProperty({ description: 'Ngày kết thúc (YYYY-MM-DD)', example: '2026-03-20' })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @IsDateString({}, { message: 'Ngày kết thúc phải có định dạng YYYY-MM-DD' })
  denNgay: string;

  @ApiProperty({
    description: 'Danh sách khung giờ cần tạo',
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
}
