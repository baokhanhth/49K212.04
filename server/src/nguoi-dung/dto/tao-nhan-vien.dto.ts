// nguoi-dung/dto/tao-nhan-vien.dto.ts
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO Request — định nghĩa dữ liệu Admin gửi lên khi tạo tài khoản nhân viên (E21.2)
export class TaoNhanVienDto {
  @ApiProperty({ example: 'Nguyen Van B', description: 'Họ tên nhân viên' })
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @MaxLength(100)
  hoTen: string;

  @ApiProperty({ example: '0905123456', description: 'Số điện thoại (10 chữ số)' })
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^\d{10}$/, { message: 'Số điện thoại phải gồm đúng 10 chữ số' })
  sdt: string;

  @ApiProperty({
    example: 'nhanvien@gmail.com',
    description: 'Email cá nhân — chấp nhận mọi định dạng hợp lệ, không bắt buộc đuôi @due.edu.vn (E21.2 - Ràng buộc 1)',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @MaxLength(80)
  emailCaNhan: string;
}