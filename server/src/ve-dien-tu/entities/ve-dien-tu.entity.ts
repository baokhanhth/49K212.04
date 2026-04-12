import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  import { DatSan } from '../../dat-san/entities/dat-san.entity';
  import { PrimaryColumn } from 'typeorm'; // thay PrimaryGeneratedColumn
  @Entity('VeDienTu')
  export class VeDienTu {
    @PrimaryColumn({ name: 'MaVe', type: 'varchar', length: 12 })
    maVe: string;
  
    @Column({ name: 'MaDatSan', unique: true })
    maDatSan: number;
  
    @Column({ name: 'QRCode', type: 'nvarchar', length: 255 })
    qrCode: string;
  
    @Column({ name: 'ThoiGianCheckIn', type: 'datetime', nullable: true })
    thoiGianCheckIn: Date | null;
  
    @Column({ name: 'ThoiGianCheckOut', type: 'datetime', nullable: true })
    thoiGianCheckOut: Date | null;
  
    @OneToOne(() => DatSan, (datSan) => datSan.veDienTu)
    @JoinColumn({ name: 'MaDatSan' })
    datSan: DatSan;
  }