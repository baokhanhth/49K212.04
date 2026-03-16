import { IsNotEmpty, IsInt, IsDateString, Matches } from 'class-validator';
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

  @ApiProperty({ description: 'Giờ bắt đầu', example: '06:00:00' })
  @IsNotEmpty({ message: 'Giờ bắt đầu không được để trống' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'Giờ bắt đầu phải đúng định dạng HH:mm hoặc HH:mm:ss',
  })
  gioBatDau: string;

  @ApiProperty({ description: 'Giờ kết thúc', example: '08:00:00' })
  @IsNotEmpty({ message: 'Giờ kết thúc không được để trống' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'Giờ kết thúc phải đúng định dạng HH:mm hoặc HH:mm:ss',
  })
  gioKetThuc: string;
}
