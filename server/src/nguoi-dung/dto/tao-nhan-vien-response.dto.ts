import { ApiProperty } from '@nestjs/swagger';

// DTO Response — định nghĩa dữ liệu trả về sau khi tạo tài khoản nhân viên thành công (E21.2)
export class TaoNhanVienResponseDto {
  @ApiProperty({ example: 5 })
  userId: number;

  @ApiProperty({ example: 'nhanvien@gmail.com' })
  username: string;

  @ApiProperty({ example: 'Nguyen Van B' })
  hoTen: string;

  @ApiProperty({ example: 'nhanvien@gmail.com' })
  emailCaNhan: string | null; //  nullable vì entity là string | null

  @ApiProperty({ example: '0905123456' })
  sdt: string | null; //  nullable vì entity là string | null

  @ApiProperty({ example: 3 })
  maVaiTro: number;

  @ApiProperty({ example: true })
  trangThai: boolean;

  @ApiProperty({ example: 'Due@12345', description: 'Mật khẩu mặc định để admin đọc cho nhân viên' })
  matKhauMacDinh: string;
}