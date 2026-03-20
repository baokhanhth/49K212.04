import { IsNotEmpty, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetMatrixDto {
  @ApiProperty({ description: 'Mã sân bãi (Từ US-18)', example: 1 })
  @IsNotEmpty({ message: 'Mã sân không được để trống' })
  @Type(() => Number) 
  @IsInt({ message: 'Mã sân phải là số nguyên' })
  maSan: number;

  @ApiProperty({ description: 'Ngày xem lịch (YYYY-MM-DD)', example: '2026-03-10' })
  @IsNotEmpty({ message: 'Ngày không được để trống' })
  @IsDateString({}, { message: 'Định dạng ngày phải là YYYY-MM-DD' })
  ngay: string;

  @ApiProperty({ description: 'ID người dùng (Để check điểm US-06)', example: 101 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  userId: number;
}