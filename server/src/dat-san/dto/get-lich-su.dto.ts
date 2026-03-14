import { IsNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetLichSuDto {
  @ApiProperty({ description: 'ID người dùng', example: 101 })
  @IsNotEmpty({ message: 'Mã người dùng không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Mã người dùng phải là số nguyên' })
  maNguoiDung: number;
}