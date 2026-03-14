import { IsNotEmpty, IsInt, IsDateString, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDatSanThuCongDto {
  @ApiProperty({ description: 'Mã người dùng đặt sân', example: 1 })
  @IsNotEmpty({ message: 'Mã người dùng không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Mã người dùng phải là số nguyên' })
  userId: number;

  @ApiProperty({ description: 'Mã sân cần đặt', example: 1 })
  @IsNotEmpty({ message: 'Mã sân không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Mã sân phải là số nguyên' })
  maSan: number;

  @ApiProperty({ description: 'Ngày đặt sân (YYYY-MM-DD)', example: '2026-03-15' })
  @IsNotEmpty({ message: 'Ngày đặt sân không được để trống' })
  @IsDateString({}, { message: 'Ngày đặt sân phải có định dạng YYYY-MM-DD' })
  ngayApDung: string;

  @ApiProperty({ description: 'Giờ bắt đầu (HH:mm hoặc HH:mm:ss)', example: '08:00:00' })
  @IsNotEmpty({ message: 'Giờ bắt đầu không được để trống' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'Giờ bắt đầu phải đúng định dạng HH:mm hoặc HH:mm:ss',
  })
  gioBatDau: string;

  @ApiProperty({ description: 'Giờ kết thúc (HH:mm hoặc HH:mm:ss)', example: '10:00:00' })
  @IsNotEmpty({ message: 'Giờ kết thúc không được để trống' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'Giờ kết thúc phải đúng định dạng HH:mm hoặc HH:mm:ss',
  })
  gioKetThuc: string;
}
