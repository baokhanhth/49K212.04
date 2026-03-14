import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('KhungGio')
export class KhungGio {
  @ApiProperty({ description: 'Mã khung giờ', example: 1 })
  @PrimaryGeneratedColumn({ name: 'MaKhungGio' })
  maKhungGio: number;

  @ApiProperty({ description: 'Giờ bắt đầu', example: '06:00:00' })
  @Column({ name: 'GioBatDau', type: 'time' })
  gioBatDau: string;

  @ApiProperty({ description: 'Giờ kết thúc', example: '08:00:00' })
  @Column({ name: 'GioKetThuc', type: 'time' })
  gioKetThuc: string;

  @OneToMany('LichSan', 'khungGio')
  lichSanList: any[];
}
