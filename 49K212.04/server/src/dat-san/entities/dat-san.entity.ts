import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("DatSan")
export class DatSan {

  @PrimaryGeneratedColumn({ name: "MaDatSan" })
  maDatSan!: number;

  @Column({ name: "UserID" })
  userId!: number;

  @Column({ name: "MaLichSan" })
  maLichSan!: number;

  @Column({ name: "NgayDat", type: "datetime" })
  ngayDat!: Date;

  @Column({ name: "TongTien", type: "decimal" })
  tongTien!: number;

  @Column({ name: "TrangThai" })
  trangThai!: string;

  @Column({ name: "NguoiDuyet", nullable: true })
  nguoiDuyet!: number;
}