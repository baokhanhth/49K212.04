import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('NguoiDung')
export class NguoiDung {
  @PrimaryGeneratedColumn({ name: 'UserID' })
  userId: number;

  @Column({ name: 'Username', type: 'nvarchar', length: 50, unique: true })
  username: string;

  @Column({ name: 'MatKhau', type: 'nvarchar', length: 255 })
  matKhau: string;

  @Column({ name: 'MSV', type: 'varchar', length: 12, nullable: true, unique: true })
  msv: string | null;

  @Column({ name: 'Lop', type: 'varchar', length: 10, nullable: true })
  lop: string | null;

  @Column({ name: 'HoTen', type: 'nvarchar', length: 100 })
  hoTen: string;

  @Column({ name: 'SDT', type: 'varchar', length: 10, nullable: true })
  sdt: string | null;

  @Column({ name: 'EmailTruong', type: 'varchar', length: 80, nullable: true, unique: true })
  emailTruong: string | null;

  @Column({ name: 'EmailCaNhan', type: 'varchar', length: 80, nullable: true, unique: true })
  emailCaNhan!: string | null;

  @Column({ name: 'AnhDaiDien', type: 'nvarchar', length: 255, nullable: true })
  anhDaiDien: string | null;

  @Column({ name: 'TrangThai', type: 'bit', default: true })
  trangThai: boolean;

  @Column({ name: 'DiemUyTin', type: 'int', default: 100 })
  diemUyTin: number;

  @Column({ name: 'MaVaiTro', type: 'int' })
  maVaiTro: number;
}