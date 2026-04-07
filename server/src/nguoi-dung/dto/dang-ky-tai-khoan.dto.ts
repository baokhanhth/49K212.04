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
    example: 'Nguyen Van A',
    description: 'Họ tên người dùng',
  })
  @IsString({ message: 'Họ tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @MaxLength(100, { message: 'Họ tên không được vượt quá 100 ký tự' })
  @Matches(/^(?!\s*$)[a-zA-ZÀ-ỹ\s]+$/, {
    message: 'Họ tên không hợp lệ',
  })
  hoTen: string;

  @ApiProperty({
    example: '123456789012',
    description: 'Mã số sinh viên gồm đúng 12 chữ số, không chứa khoảng trắng',
  })
  @IsString({ message: 'MSSV phải là chuỗi' })
  @IsNotEmpty({ message: 'MSSV không được để trống' })
  @Matches(/^[0-9]{12}$/, {
    message: 'MSSV phải gồm đúng 12 chữ số',
  })
  @Matches(/^\S+$/, {
    message: 'MSSV không được chứa khoảng trắng',
  })
  msv: string;

  @ApiProperty({
    example: '48K21.1',
    description: 'Lớp sinh hoạt',
  })
  @IsString({ message: 'Lớp phải là chuỗi' })
  @IsNotEmpty({ message: 'Lớp không được để trống' })
  @MaxLength(10, { message: 'Lớp không được vượt quá 10 ký tự' })
  @Matches(/^[a-zA-Z0-9.]+$/, {
    message: 'Lớp chỉ được chứa chữ, số và dấu chấm',
  })
  lop: string;

  @ApiProperty({
    example: '123456789012@due.udn.vn',
    description: 'Email trường có dạng MSSV@due.udn.vn',
  })
  @IsString({ message: 'Email trường phải là chuỗi' })
  @IsNotEmpty({ message: 'Email trường không được để trống' })
  @Matches(/^[0-9]{12}@due\.udn\.vn$/, {
    message: 'Email trường phải có dạng MSSV@due.udn.vn',
  })
  @Matches(/^\S+$/, {
    message: 'Email trường không được chứa khoảng trắng',
  })
  emailTruong: string;

  @ApiProperty({
    example: 'MatKhau@123',
    description:
      'Mật khẩu có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không được vượt quá 50 ký tự' })
  @Matches(/^\S+$/, {
    message: 'Mật khẩu không được chứa khoảng trắng',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/, {
    message: 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
  matKhau: string;

  @ApiProperty({
    example: 'MatKhau@123',
    description: 'Xác nhận mật khẩu',
  })
  @IsString({ message: 'Xác nhận mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Xác nhận mật khẩu không được để trống' })
  @Matches(/^\S+$/, {
    message: 'Xác nhận mật khẩu không được chứa khoảng trắng',
  })
  xacNhanMatKhau: string;

  @ApiProperty({
    example: 'nguyenvana@gmail.com',
    description: 'Email cá nhân',
  })
  @IsString({ message: 'Email cá nhân phải là chuỗi' })
  @IsNotEmpty({ message: 'Email cá nhân không được để trống' })
  @IsEmail({}, { message: 'Email cá nhân không hợp lệ' })
  @MaxLength(80, { message: 'Email cá nhân không được vượt quá 80 ký tự' })
  @Matches(/^\S+$/, {
    message: 'Email cá nhân không được chứa khoảng trắng',
  })
  emailCaNhan: string;
}