import { IsNotEmpty, IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLichSanDto {
  @ApiProperty({ description: 'Mã sân', example: 1 })
  @IsNotEmpty({ message: 'Mã sân không được để trống' })
  @IsInt({ message: 'Mã sân phải là số nguyên' })
  maSan: number;

  @ApiProperty({ description: 'Ngày áp dụng (YYYY-MM-DD)', example: '2026-03-15' })
  @IsNotEmpty({ message: 'Ngày áp dụng không được để trống' })
  @IsDateString({}, { message: 'Ngày áp dụng phải có định dạng YYYY-MM-DD' })
  ngayApDung: string;

  @ApiProperty({ description: 'Mã khung giờ', example: 1 })
  @IsNotEmpty({ message: 'Mã khung giờ không được để trống' })
  @IsInt({ message: 'Mã khung giờ phải là số nguyên' })
  maKhungGio: number;
}
