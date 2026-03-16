import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('CauHinhHeThong')
export class CauHinhHeThong {
  @ApiProperty({ description: 'Mã cấu hình', example: 1 })
  @PrimaryGeneratedColumn({ name: 'MaCauHinh' })
  maCauHinh!: number;

  @ApiProperty({
    description: 'Tên cấu hình (key)',
    example: 'SO_NGAY_DAT_TRUOC',
  })
  @Column({ name: 'TenCauHinh', type: 'nvarchar', length: 100, unique: true })
  tenCauHinh!: string;

  @ApiProperty({ description: 'Giá trị cấu hình', example: '7' })
  @Column({ name: 'GiaTri', type: 'nvarchar', length: 255 })
  giaTri!: string;

  @ApiPropertyOptional({
    description: 'Mô tả cấu hình',
    example: 'Số ngày tối đa cho phép đặt trước sân',
  })
  @Column({ name: 'MoTa', type: 'nvarchar', length: 500, nullable: true })
  moTa!: string | null;
}
