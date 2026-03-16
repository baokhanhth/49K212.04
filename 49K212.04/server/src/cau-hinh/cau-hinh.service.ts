import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CauHinhHeThong } from './entities/cau-hinh.entity';
import { UpdateSoNgayDatTruocDto } from './dto/update-so-ngay-dat-truoc.dto';

/** Key cấu hình số ngày đặt trước */
const CAU_HINH_SO_NGAY_DAT_TRUOC = 'SO_NGAY_DAT_TRUOC';

/** Giá trị mặc định nếu chưa có cấu hình */
const DEFAULT_SO_NGAY_DAT_TRUOC = 7;

export interface ThongTinDatSan {
  soNgayDatTruoc: number;
  ngayBatDau: string; // YYYY-MM-DD
  ngayKetThuc: string; // YYYY-MM-DD
}

@Injectable()
export class CauHinhService {
  constructor(
    @InjectRepository(CauHinhHeThong)
    private readonly cauHinhRepo: Repository<CauHinhHeThong>,
  ) {}

  /**
   * Lấy toàn bộ cấu hình hệ thống
   */
  async findAll(): Promise<CauHinhHeThong[]> {
    return this.cauHinhRepo.find({ order: { maCauHinh: 'ASC' } });
  }

  /**
   * Lấy giá trị cấu hình theo tên key
   */
  async getByKey(tenCauHinh: string): Promise<CauHinhHeThong | null> {
    return this.cauHinhRepo.findOne({ where: { tenCauHinh } });
  }

  /**
   * Lấy số ngày đặt trước hiện tại
   */
  async getSoNgayDatTruoc(): Promise<number> {
    const cauHinh = await this.getByKey(CAU_HINH_SO_NGAY_DAT_TRUOC);
    if (!cauHinh) {
      return DEFAULT_SO_NGAY_DAT_TRUOC;
    }
    return parseInt(cauHinh.giaTri, 10) || DEFAULT_SO_NGAY_DAT_TRUOC;
  }

  /**
   * Lấy thông tin cấu hình đặt sân:
   * - soNgayDatTruoc: số ngày max
   * - ngayBatDau: hôm nay (YYYY-MM-DD)
   * - ngayKetThuc: hôm nay + soNgayDatTruoc (YYYY-MM-DD)
   */
  async getThongTinDatSan(): Promise<ThongTinDatSan> {
    const soNgay = await this.getSoNgayDatTruoc();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + soNgay);

    return {
      soNgayDatTruoc: soNgay,
      ngayBatDau: this.formatDate(today),
      ngayKetThuc: this.formatDate(endDate),
    };
  }

  /**
   * Admin cập nhật số ngày đặt trước
   */
  async updateSoNgayDatTruoc(
    dto: UpdateSoNgayDatTruocDto,
  ): Promise<ThongTinDatSan> {
    let cauHinh = await this.getByKey(CAU_HINH_SO_NGAY_DAT_TRUOC);

    if (cauHinh) {
      cauHinh.giaTri = String(dto.soNgayDatTruoc);
      await this.cauHinhRepo.save(cauHinh);
    } else {
      // Tạo mới nếu chưa tồn tại
      cauHinh = this.cauHinhRepo.create({
        tenCauHinh: CAU_HINH_SO_NGAY_DAT_TRUOC,
        giaTri: String(dto.soNgayDatTruoc),
        moTa: 'Số ngày tối đa cho phép đặt trước sân',
      });
      await this.cauHinhRepo.save(cauHinh);
    }

    return this.getThongTinDatSan();
  }

  /**
   * Kiểm tra ngày đặt sân có nằm trong khoảng cho phép không.
   * Trả về true nếu hợp lệ, throw BadRequestException nếu không.
   */
  async validateNgayDatSan(ngayApDung: string): Promise<boolean> {
    const thongTin = await this.getThongTinDatSan();

    const ngayChon = new Date(ngayApDung);
    ngayChon.setHours(0, 0, 0, 0);

    const ngayBatDau = new Date(thongTin.ngayBatDau);
    ngayBatDau.setHours(0, 0, 0, 0);

    const ngayKetThuc = new Date(thongTin.ngayKetThuc);
    ngayKetThuc.setHours(0, 0, 0, 0);

    if (ngayChon < ngayBatDau || ngayChon > ngayKetThuc) {
      throw new BadRequestException(
        `Ngày ${ngayApDung} nằm ngoài khoảng cho phép đặt sân. ` +
          `Chỉ được đặt từ ${thongTin.ngayBatDau} đến ${thongTin.ngayKetThuc} ` +
          `(${thongTin.soNgayDatTruoc} ngày kể từ hôm nay)`,
      );
    }

    return true;
  }

  /**
   * Format Date -> YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
