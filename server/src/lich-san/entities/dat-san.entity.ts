import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LichSan } from './lich-san.entity';

@Entity('DatSan')
export class DatSan {
  @ApiProperty({ description: 'Mã đặt sân', example: 1 })
  @PrimaryGeneratedColumn({ name: 'MaDatSan' })
  maDatSan: number;

  @ApiProperty({ description: 'Mã lịch sân', example: 120 })
  @Column({ name: 'MaLichSan', unique: true })
  maLichSan: number;

  @ApiPropertyOptional({
    description: 'Trạng thái đặt sân',
    example: 'Chờ duyệt',
  })
  @Column({ name: 'TrangThai', type: 'nvarchar', length: 50, default: 'Chờ duyệt' })
  trangThai: string;

  @OneToOne(() => LichSan, (lichSan) => lichSan.datSan)
  @JoinColumn({ name: 'MaLichSan' })
  lichSan: LichSan;
}
