import { IsOptional, IsEmail, IsString, Matches, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CapNhatHoSoDto {
  @ApiPropertyOptional({ example: 'nguyenvana@gmail.com', description: 'Email cá nhân' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(80)
  emailCaNhan?: string;

  @ApiPropertyOptional({ example: '0901234567', description: 'Số điện thoại (10 chữ số)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Số điện thoại không hợp lệ' })
  sdt?: string;
}
