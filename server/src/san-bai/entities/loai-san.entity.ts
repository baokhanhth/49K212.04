import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('LoaiSan')
export class LoaiSan {
  @ApiProperty({ description: 'Mã loại sân', example: 1 })
  @PrimaryGeneratedColumn({ name: 'MaLoaiSan' })
  maLoaiSan: number;

  @ApiProperty({ description: 'Tên loại sân', example: 'Sân 5 người' })
  @Column({ name: 'TenLoaiSan', type: 'nvarchar', length: 100, unique: true })
  tenLoaiSan: string;

  @OneToMany('SanBai', 'loaiSan')
  sanBaiList: any[];
}
