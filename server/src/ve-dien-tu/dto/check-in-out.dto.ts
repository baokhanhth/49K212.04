import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInOutDto {
  @ApiProperty({
    description: 'Mã QR Code trên vé điện tử',
    example: 'VE-42-1710000000000-AB3XY9Z1',
  })
  @IsNotEmpty({ message: 'QR Code không được để trống' })
  @IsString({ message: 'QR Code phải là chuỗi ký tự' })
  qrCode: string;
}