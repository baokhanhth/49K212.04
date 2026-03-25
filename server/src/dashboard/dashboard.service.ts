import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SanBai } from '../san-bai/entities/san-bai.entity';
import { DatSan } from '../lich-san/entities/dat-san.entity';
import { LichSan } from '../lich-san/entities/lich-san.entity';
import { QueryLichTongHopDto } from './dto/query-lich-tong-hop.dto';

/** Trạng thái tính doanh thu (E19.5) */
const TRANG_THAI_DOANH_THU = ['Đã thanh toán', 'Đã check-in', 'Hoàn thành'];

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(SanBai)
    private readonly sanBaiRepo: Repository<SanBai>,
    @InjectRepository(DatSan)
    private readonly datSanRepo: Repository<DatSan>,
    @InjectRepository(LichSan)
    private readonly lichSanRepo: Repository<LichSan>,
  ) {}

  // ═══════════════════════════════════════════════════
  //  E19.2 – Thống kê tổng quan
  // ═══════════════════════════════════════════════════

  async getThongKeTongQuan() {
    const [tongSoSan, datSanHomNay, choDuyet, doanhThuThang] =
      await Promise.all([
        this.getTongSoSan(),
        this.getDatSanHomNay(),
        this.getChoDuyet(),
        this.getDoanhThuThang(),
      ]);

    return { tongSoSan, datSanHomNay, choDuyet, doanhThuThang };
  }

  // ───────────── E19.2 + Tổng số sân ─────────────

  private async getTongSoSan(): Promise<number> {
    return this.sanBaiRepo.count();
  }

  // ───────────── E19.3 – Đặt sân hôm nay ─────────────

  private async getDatSanHomNay(): Promise<number> {
    const today = this.formatDate(new Date());

    const result = await this.datSanRepo
      .createQueryBuilder('ds')
      .where('CAST(ds.NgayDat AS DATE) = :today', { today })
      .getCount();

    return result;
  }

  // ───────────── E19.4 – Chờ duyệt ─────────────

  private async getChoDuyet(): Promise<number> {
    return this.datSanRepo.count({
      where: { trangThai: 'Chờ duyệt' },
    });
  }

  // ───────────── E19.5 – Doanh thu tháng ─────────────

  private async getDoanhThuThang(): Promise<number> {
    const now = new Date();
    const firstDay = this.formatDate(
      new Date(now.getFullYear(), now.getMonth(), 1),
    );
    const lastDay = this.formatDate(
      new Date(now.getFullYear(), now.getMonth() + 1, 0),
    );

    const result = await this.datSanRepo
      .createQueryBuilder('ds')
      .select('COALESCE(SUM(ds.TongTien), 0)', 'total')
      .where('ds.TrangThai IN (:...trangThai)', {
        trangThai: TRANG_THAI_DOANH_THU,
      })
      .andWhere('CAST(ds.NgayDat AS DATE) >= :firstDay', { firstDay })
      .andWhere('CAST(ds.NgayDat AS DATE) <= :lastDay', { lastDay })
      .getRawOne();

    return Number(result?.total ?? 0);
  }

  // ═══════════════════════════════════════════════════
  //  E19.8 – Thống kê hiệu suất (per sân)
  // ═══════════════════════════════════════════════════

  async getHieuSuat() {
    const rows = await this.datSanRepo
      .createQueryBuilder('ds')
      .innerJoin('ds.lichSan', 'ls')
      .innerJoin('ls.sanBai', 'sb')
      .select('sb.MaSan', 'maSan')
      .addSelect('sb.TenSan', 'tenSan')
      .addSelect('COUNT(ds.MaDatSan)', 'soLuongBooking')
      .addSelect(
        `COALESCE(SUM(CASE WHEN ds.TrangThai IN (:...trangThai) THEN ds.TongTien ELSE 0 END), 0)`,
        'doanhThu',
      )
      .setParameter('trangThai', TRANG_THAI_DOANH_THU)
      .groupBy('sb.MaSan')
      .addGroupBy('sb.TenSan')
      .orderBy('sb.MaSan', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      maSan: Number(r.maSan),
      tenSan: r.tenSan,
      soLuongBooking: Number(r.soLuongBooking),
      doanhThu: Number(r.doanhThu),
    }));
  }

  // ═══════════════════════════════════════════════════
  //  E19.9 – Lịch tổng hợp
  // ═══════════════════════════════════════════════════

  async getLichTongHop(query: QueryLichTongHopDto) {
    const ngay = query.ngay || this.formatDate(new Date());
    const { tuNgay, denNgay } = this.getDateRange(
      ngay,
      query.cheDoXem || 'ngay',
    );

    const qb = this.lichSanRepo
      .createQueryBuilder('ls')
      .leftJoinAndSelect('ls.sanBai', 'sb')
      .leftJoinAndSelect('ls.datSan', 'ds')
      .where('ls.NgayApDung >= :tuNgay', { tuNgay })
      .andWhere('ls.NgayApDung <= :denNgay', { denNgay });

    if (query.maSan) {
      qb.andWhere('ls.MaSan = :maSan', { maSan: query.maSan });
    }

    qb.orderBy('ls.NgayApDung', 'ASC').addOrderBy('ls.GioBatDau', 'ASC');

    const lichSans = await qb.getMany();

    return lichSans.map((lich) => ({
      maLichSan: lich.maLichSan,
      maSan: lich.maSan,
      tenSan: lich.sanBai?.tenSan ?? null,
      ngayApDung: lich.ngayApDung,
      khungGio: `${this.fmtTime(lich.gioBatDau)} - ${this.fmtTime(lich.gioKetThuc)}`,
      tinhTrang: this.mapTinhTrang(lich),
    }));
  }

  // ───────────── Helpers ─────────────

  /**
   * E19.9 – Phân loại tình trạng sử dụng sân
   *  Trống | Chờ duyệt | Đã được đặt | Đang sử dụng | Đã sử dụng xong | Không sử dụng | Bảo trì
   */
  private mapTinhTrang(lich: LichSan): string {
    if (lich.sanBai?.trangThai === 'Bảo trì') return 'Bảo trì';
    if (!lich.datSan) return 'Trống';

    const tt = lich.datSan.trangThai;
    switch (tt) {
      case 'Chờ duyệt':
        return 'Chờ duyệt';
      case 'Đã duyệt':
        return 'Đã được đặt';
      case 'Đã check-in':
        return 'Đang sử dụng';
      case 'Hoàn thành':
        return 'Đã sử dụng xong';
      case 'No-show':
        return 'Không sử dụng';
      default:
        return tt; // Bị từ chối, Đã hủy, etc.
    }
  }

  private getDateRange(
    ngay: string,
    cheDoXem: string,
  ): { tuNgay: string; denNgay: string } {
    const d = new Date(ngay);

    if (cheDoXem === 'tuan') {
      const dayOfWeek = d.getDay(); // 0 = CN
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((dayOfWeek + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { tuNgay: this.formatDate(monday), denNgay: this.formatDate(sunday) };
    }

    if (cheDoXem === 'thang') {
      const first = new Date(d.getFullYear(), d.getMonth(), 1);
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return { tuNgay: this.formatDate(first), denNgay: this.formatDate(last) };
    }

    // ngay
    return { tuNgay: ngay, denNgay: ngay };
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private fmtTime(value: string): string {
    return typeof value === 'string'
      ? value.substring(0, 5)
      : new Date(value).toLocaleTimeString('it-IT').substring(0, 5);
  }
}
