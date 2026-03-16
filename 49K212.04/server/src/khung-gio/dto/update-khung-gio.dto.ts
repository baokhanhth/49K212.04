import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateKhungGioDto {
  @ApiPropertyOptional({
    description: 'Giờ bắt đầu (HH:mm hoặc HH:mm:ss)',
    example: '06:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'Giờ bắt đầu phải có định dạng HH:mm hoặc HH:mm:ss',
  })
  gioBatDau?: string;

  @ApiPropertyOptional({
    description: 'Giờ kết thúc (HH:mm hoặc HH:mm:ss)',
    example: '08:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'Giờ kết thúc phải có định dạng HH:mm hoặc HH:mm:ss',
  })
  gioKetThuc?: string;
}
