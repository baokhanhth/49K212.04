import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { LichSan } from '../../lich-san/entities/lich-san.entity';

@Entity('DatSan')
export class DatSan {
  @ApiProperty({ description: 'Mã đặt sân', example: 1 })
  @PrimaryGeneratedColumn({ name: 'MaDatSan' })
  maDatSan: number;

  @ApiProperty({ description: 'Mã lịch sân', example: 1 })
  @Column({ name: 'MaLichSan' })
  maLichSan: number;

  @ApiProperty({ description: 'Mã người dùng', example: 101 })
  @Column({ name: 'UserID' })
  maNguoiDung: number;

  @ApiProperty({ description: 'Trạng thái', example: 'Chờ duyệt' })
  @Column({ name: 'TrangThai', default: 'Chờ duyệt' })
  trangThai: string;

  @ApiProperty({ description: 'Ngày đặt' })
  @Column({ name: 'NgayDat', type: 'datetime' })
  ngayDat: Date;

  @ApiProperty({ description: 'Tổng tiền' })
  @Column({ name: 'TongTien', type: 'decimal', precision: 18, scale: 2, nullable: true })
  tongTien: number;

  @OneToOne(() => LichSan, (lichSan) => lichSan.datSan)
  @JoinColumn({ name: 'MaLichSan' })
  lichSan: LichSan;
}