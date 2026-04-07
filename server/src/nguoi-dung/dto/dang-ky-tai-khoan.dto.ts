import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DangKyTaiKhoanDto {
  @ApiProperty({
    example: '123456789012@due.udn.vn',
    description: 'Tên đăng nhập = MSSV + @due.udn.vn',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @Matches(/^\d{12}@due\.udn\.vn$/, {
    message: 'Username phải có dạng MSSV (12 số) + @due.udn.vn',
  })
  username: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @MaxLength(100, { message: 'Họ tên không được vượt quá 100 ký tự' })
  hoTen: string;

  @ApiProperty({ example: '123456789012' })
  @IsString()
  @IsNotEmpty({ message: 'MSSV không được để trống' })
  @Matches(/^\d{12}$/, {
    message: 'MSSV phải gồm đúng 12 chữ số',
  })
  msv: string;

  @ApiProperty({ example: '48K21.1' })
  @IsString()
  @IsNotEmpty({ message: 'Lớp không được để trống' })
  @MaxLength(10, { message: 'Lớp không được vượt quá 10 ký tự' })
  lop: string;

  @ApiProperty({
    example: '123456789012@due.udn.vn',
    description: 'Email trường = MSSV + @due.udn.vn',
  })
  @IsString()
  @IsNotEmpty({ message: 'Email trường không được để trống' })
  @Matches(/^\d{12}@due\.udn\.vn$/, {
    message: 'Email trường phải có dạng MSSV + @due.udn.vn',
  })
  emailTruong: string;

  @ApiProperty({
    example: 'MatKhau@123',
    description:
      'Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/, {
    message:
      'Mật khẩu phải có ít nhất 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  })
  matKhau: string;

  @ApiProperty({
    example: 'nguyenvana@gmail.com',
    description: 'Email cá nhân',
  })
  @IsString()
  @IsNotEmpty({ message: 'Email cá nhân không được để trống' })
  @IsEmail({}, { message: 'Email cá nhân không hợp lệ' })
  @MaxLength(80, { message: 'Email cá nhân không được vượt quá 80 ký tự' })
  emailCaNhan: string;
}