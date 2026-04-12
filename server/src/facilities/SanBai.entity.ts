
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LoaiSan } from './LoaiSan.entity';

@Entity('SanBai')
export class SanBai {
  @PrimaryGeneratedColumn({ name: 'MaSan' })
  maSan: number;

  @Column({ name: 'TenSan' })
  tenSan: string;

  @Column({ name: 'HinhAnh', nullable: true })
  hinhAnh: string;

  @Column({ name: 'ViTri', nullable: true })
  viTri: string;

  @Column({ name: 'GiaThue', type: 'decimal' })
  giaThue: number;

  @Column({ name: 'TrangThai' })
  trangThai: string;

  @Column({ name: 'MaLoaiSan' })
  maLoaiSan: number;

  @Column({ name: 'SoNgayDatTruoc', type: 'int', default: 7 })
  soNgayDatTruoc: number;

  @ManyToOne(() => LoaiSan)
  @JoinColumn({ name: 'MaLoaiSan' })
  loaiSan: LoaiSan;
}
