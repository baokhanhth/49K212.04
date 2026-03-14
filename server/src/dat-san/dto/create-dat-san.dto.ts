import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDatSanDto {
  @ApiProperty({ description: 'Mã người dùng đặt sân', example: 1 })
  @IsNotEmpty({ message: 'Mã người dùng không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Mã người dùng phải là số nguyên' })
  userId: number;

  @ApiProperty({ description: 'Mã lịch sân cần đặt', example: 1 })
  @IsNotEmpty({ message: 'Mã lịch sân không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Mã lịch sân phải là số nguyên' })
  maLichSan: number;
}
