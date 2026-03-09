import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKhungGioDto {
  @ApiProperty({
    description: 'Giờ bắt đầu (HH:mm hoặc HH:mm:ss)',
    example: '06:00',
  })
  @IsNotEmpty({ message: 'Giờ bắt đầu không được để trống' })
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'Giờ bắt đầu phải có định dạng HH:mm hoặc HH:mm:ss',
  })
  gioBatDau: string;

  @ApiProperty({
    description: 'Giờ kết thúc (HH:mm hoặc HH:mm:ss), phải lớn hơn giờ bắt đầu',
    example: '08:00',
  })
  @IsNotEmpty({ message: 'Giờ kết thúc không được để trống' })
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'Giờ kết thúc phải có định dạng HH:mm hoặc HH:mm:ss',
  })
  gioKetThuc: string;
}
