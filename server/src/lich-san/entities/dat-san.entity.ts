import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LichSan } from './lich-san.entity';

@Entity('DatSan')
export class DatSan {
  @ApiProperty({ description: 'Mã đặt sân', example: 1 })
  @PrimaryGeneratedColumn({ name: 'MaDatSan' })
  maDatSan: number;

  @ApiProperty({ description: 'Mã người dùng đặt sân', example: 1 })
  @Column({ name: 'UserID' })
  userId: number;

  @ApiProperty({ description: 'Mã lịch sân', example: 120 })
  @Column({ name: 'MaLichSan', unique: true })
  maLichSan: number;

  @ApiProperty({ description: 'Ngày đặt', example: '2026-03-14T10:00:00' })
  @Column({ name: 'NgayDat', type: 'datetime', default: () => 'GETDATE()' })
  ngayDat: Date;

  @ApiPropertyOptional({ description: 'Tổng tiền', example: 150000 })
  @Column({ name: 'TongTien', type: 'decimal', precision: 18, scale: 2, nullable: true })
  tongTien: number | null;

  @ApiPropertyOptional({
    description: 'Trạng thái đặt sân',
    example: 'Chờ duyệt',
  })
  @Column({ name: 'TrangThai', type: 'nvarchar', length: 50, default: 'Chờ duyệt' })
  trangThai: string;

  @ApiPropertyOptional({ description: 'Mã người duyệt', example: 2 })
  @Column({ name: 'NguoiDuyet', nullable: true })
  nguoiDuyet: number | null;

  @OneToOne(() => LichSan, (lichSan) => lichSan.datSan)
  @JoinColumn({ name: 'MaLichSan' })
  lichSan: LichSan;
}
