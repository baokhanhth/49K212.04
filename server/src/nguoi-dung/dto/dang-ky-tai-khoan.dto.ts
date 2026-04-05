import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MinLength,
    MaxLength,
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
    @IsNotEmpty()
    @MaxLength(100)
    hoTen: string;
  
    @ApiProperty({ example: '123456789012' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{12}$/, {
      message: 'MSSV phải gồm đúng 12 chữ số',
    })
    msv: string;
  
    @ApiProperty({ example: '48K21.1' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    lop: string;
  
    @ApiProperty({
      example: '123456789012@due.udn.vn',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{12}@due\.udn\.vn$/, {
      message: 'Email trường phải có dạng MSSV + @due.udn.vn',
    })
    emailTruong: string;
  
    @ApiProperty({ example: 'MatKhau@123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/, {
      message: 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt',
    })
    matKhau: string;

    @ApiProperty({ example: 'MatKhau@123', description: 'Xác nhận mật khẩu' })
    @IsString()
    @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
    xacNhanMatKhau: string;

    @ApiProperty({ example: 'nguyenvana@gmail.com', description: 'Email cá nhân' })
    @IsString()
    @IsNotEmpty({ message: 'Email cá nhân không được để trống' })
    @IsEmail({}, { message: 'Email cá nhân không hợp lệ' })
    @MaxLength(80)
    emailCaNhan: string;
  }