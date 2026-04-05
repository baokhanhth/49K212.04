import { ApiProperty } from '@nestjs/swagger';

export class DangKyResponseDto {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  username: string;

  @ApiProperty()
  hoTen: string;

  @ApiProperty()
  msv: string | null;

  @ApiProperty()
  lop: string | null;

  @ApiProperty()
  emailTruong: string | null;

  @ApiProperty()
  maVaiTro: number;

  @ApiProperty()
  trangThai: boolean;

  @ApiProperty()
  diemUyTin: number;
}