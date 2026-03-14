import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("ChiTietDatSan")
export class ChiTietDatSan {

  @PrimaryGeneratedColumn({ name: "MaChiTiet" })
  maChiTiet!: number;

  @Column({ name: "MaDatSan" })
  maDatSan: number;

  @Column({ name: "GiaTheoGio", type: "decimal" })
  giaTheoGio: number;
}