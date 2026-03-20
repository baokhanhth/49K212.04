import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({ description: 'Mã đặt sân (từ QR code)', example: 1 })
  @IsNotEmpty({ message: 'Mã đặt sân không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Mã đặt sân phải là số nguyên' })
  maDatSan: number;
}
