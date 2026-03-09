import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SanBai } from '../../san-bai/entities/san-bai.entity';
import { DatSan } from './dat-san.entity';

@Entity('LichSan')
@Unique('UQ_LichSan', ['maSan', 'ngayApDung', 'gioBatDau', 'gioKetThuc'])
export class LichSan {
  @ApiProperty({ description: 'Mã lịch sân', example: 1 })
  @PrimaryGeneratedColumn({ name: 'MaLichSan' })
  maLichSan: number;

  @ApiProperty({ description: 'Mã sân', example: 1 })
  @Column({ name: 'MaSan' })
  maSan: number;

  @ApiProperty({ description: 'Ngày áp dụng', example: '2026-03-15' })
  @Column({ name: 'NgayApDung', type: 'date' })
  ngayApDung: string;

  @ApiProperty({ description: 'Giờ bắt đầu', example: '06:00:00' })
  @Column({ name: 'GioBatDau', type: 'nvarchar', length: 8 })
  gioBatDau: string;

  @ApiProperty({ description: 'Giờ kết thúc', example: '08:00:00' })
  @Column({ name: 'GioKetThuc', type: 'nvarchar', length: 8 })
  gioKetThuc: string;

  @ApiPropertyOptional({ description: 'Thông tin sân', type: () => SanBai })
  @ManyToOne(() => SanBai, (sanBai) => sanBai.lichSanList)
  @JoinColumn({ name: 'MaSan' })
  sanBai: SanBai;

  @ApiPropertyOptional({ description: 'Thông tin đặt sân', type: () => DatSan })
  @OneToOne(() => DatSan, (datSan) => datSan.lichSan)
  datSan: DatSan | null;
}
