import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class TimeRangeDto {
  @ApiProperty({ description: 'Giờ bắt đầu', example: '06:00:00' })
  @IsNotEmpty({ message: 'Giờ bắt đầu không được để trống' })
  @IsString({ message: 'Giờ bắt đầu phải là chuỗi' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'Giờ bắt đầu phải đúng định dạng HH:mm hoặc HH:mm:ss',
  })
  gioBatDau: string;

  @ApiProperty({ description: 'Giờ kết thúc', example: '08:00:00' })
  @IsNotEmpty({ message: 'Giờ kết thúc không được để trống' })
  @IsString({ message: 'Giờ kết thúc phải là chuỗi' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'Giờ kết thúc phải đúng định dạng HH:mm hoặc HH:mm:ss',
  })
  gioKetThuc: string;
}
