import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DangNhapDto {
  @ApiProperty({
    example: '123456789012@due.udn.vn',
    description: 'Email/MSSV của người dùng',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tài khoản không được để trống' })
  username: string;

  @ApiProperty({
    example: 'MatKhau@123',
    description: 'Mật khẩu',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  matKhau: string;
}
