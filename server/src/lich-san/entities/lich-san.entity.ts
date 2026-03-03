import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SanBai } from '../../san-bai/entities/san-bai.entity';
import { KhungGio } from '../../khung-gio/entities/khung-gio.entity';

@Entity('LichSan')
@Unique('UQ_LichSan', ['maSan', 'ngayApDung', 'maKhungGio'])
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

  @ApiProperty({ description: 'Mã khung giờ', example: 1 })
  @Column({ name: 'MaKhungGio' })
  maKhungGio: number;

  @ApiPropertyOptional({ description: 'Mã đặt sân (null = trống)', example: null })
  @Column({ name: 'MaDatSan', type: 'varchar', length: 10, nullable: true })
  maDatSan: string | null;

  @ApiProperty({ description: 'Lịch bị khoá (sinh viên không được đặt)', example: false })
  @Column({ name: 'BiKhoa', type: 'bit', default: false })
  biKhoa: boolean;

  @ApiPropertyOptional({ description: 'Lý do khoá lịch', example: 'Trường có sự kiện' })
  @Column({ name: 'LyDoKhoa', type: 'nvarchar', length: 500, nullable: true })
  lyDoKhoa: string | null;

  @ApiPropertyOptional({ description: 'Thông tin sân', type: () => SanBai })
  @ManyToOne(() => SanBai, (sanBai) => sanBai.lichSanList)
  @JoinColumn({ name: 'MaSan' })
  sanBai: SanBai;

  @ApiPropertyOptional({ description: 'Thông tin khung giờ', type: () => KhungGio })
  @ManyToOne(() => KhungGio, (khungGio) => khungGio.lichSanList)
  @JoinColumn({ name: 'MaKhungGio' })
  khungGio: KhungGio;
}
