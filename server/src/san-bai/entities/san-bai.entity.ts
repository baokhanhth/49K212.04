import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoaiSan } from './loai-san.entity';

@Entity('SanBai')
export class SanBai {
  @ApiProperty({ description: 'Mã sân', example: 1 })
  @PrimaryGeneratedColumn({ name: 'MaSan' })
  maSan: number;

  @ApiProperty({ description: 'Tên sân', example: 'Sân A' })
  @Column({ name: 'TenSan', type: 'nvarchar', length: 80 })
  tenSan: string;

  @ApiPropertyOptional({ description: 'Đường dẫn hình ảnh', example: null })
  @Column({ name: 'HinhAnh', type: 'varchar', length: 255, nullable: true })
  hinhAnh: string | null;

  @ApiPropertyOptional({ description: 'Vị trí sân', example: 'Khu A' })
  @Column({ name: 'ViTri', type: 'nvarchar', length: 50, nullable: true })
  viTri: string | null;

  @ApiProperty({ description: 'Giá thuê (VNĐ)', example: 200000 })
  @Column({ name: 'GiaThue', type: 'decimal', precision: 18, scale: 2 })
  giaThue: number;

  @ApiProperty({
    description: 'Trạng thái sân',
    example: 'Hoạt động',
    enum: ['Hoạt động', 'Bảo trì', 'Không hoạt động'],
  })
  @Column({ name: 'TrangThai', type: 'nvarchar', length: 50, default: 'Hoạt động' })
  trangThai: string;

  @ApiProperty({ description: 'Số ngày cho phép đặt trước', example: 7, default: 7 })
  @Column({ name: 'SoNgayDatTruoc', type: 'int', default: 7 })
  soNgayDatTruoc: number;

  @ApiProperty({ description: 'Mã loại sân', example: 1 })
  @Column({ name: 'MaLoaiSan' })
  maLoaiSan: number;

  @ApiPropertyOptional({ description: 'Thông tin loại sân', type: () => LoaiSan })
  @ManyToOne(() => LoaiSan, (loaiSan) => loaiSan.sanBaiList)
  @JoinColumn({ name: 'MaLoaiSan' })
  loaiSan: LoaiSan;

  @OneToMany('LichSan', 'sanBai')
  lichSanList: any[];
}
