import { IsOptional, IsIn, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryLichTongHopDto {
  @ApiPropertyOptional({
    description: 'Chế độ xem: ngay / tuan / thang',
    example: 'ngay',
    enum: ['ngay', 'tuan', 'thang'],
  })
  @IsOptional()
  @IsIn(['ngay', 'tuan', 'thang'], { message: "cheDoXem phải là 'ngay', 'tuan' hoặc 'thang'" })
  cheDoXem?: string = 'ngay';

  @ApiPropertyOptional({
    description: 'Ngày cần xem (YYYY-MM-DD). Mặc định là hôm nay.',
    example: '2026-03-20',
  })
  @IsOptional()
  @IsString()
  ngay?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo mã sân cụ thể',
    example: 1,
  })
  @IsOptional()
  maSan?: number;
}
