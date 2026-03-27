import { ApiProperty } from '@nestjs/swagger';

export class DangNhapResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({
    example: {
      userId: 1,
      username: '123456789012@due.udn.vn',
      hoTen: 'Nguyễn Văn A',
      maVaiTro: 2,
      msv: '123456789012',
      anhDaiDien: null,
    },
  })
  user: {
    userId: number;
    username: string;
    hoTen: string;
    maVaiTro: number;
    msv: string | null;
    anhDaiDien: string | null;
  };
}
