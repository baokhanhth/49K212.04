import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class KhoaQuyenDto {
  @ApiProperty({ description: 'Mã admin thực hiện', example: 7 })
  @Type(() => Number)
  @IsInt()
  nguoiThucHien: number;

  @ApiPropertyOptional({ description: 'Lý do khóa', example: 'Vi phạm nội quy' })
  @IsOptional()
  @IsString()
  lyDo?: string;
}