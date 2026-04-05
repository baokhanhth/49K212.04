import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LoaiSan')
export class LoaiSan {
  @PrimaryGeneratedColumn({ name: 'MaLoaiSan' })
  maLoaiSan: number;

  @Column({ name: 'TenLoaiSan' })
  tenLoaiSan: string;
}