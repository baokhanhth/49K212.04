import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatSan } from '../lich-san/entities/dat-san.entity';
import { LichSan } from '../lich-san/entities/lich-san.entity';

/** Ngưỡng trễ tối đa cho phép check-in (phút) */
const MAX_LATE_MINUTES = 20;

@Injectable()
export class CheckInService {
  constructor(
    @InjectRepository(DatSan)
    private readonly datSanRepo: Repository<DatSan>,
    @InjectRepository(LichSan)
    private readonly lichSanRepo: Repository<LichSan>,
  ) {}

  // ───────────── E15.2 – Tra cứu thông tin vé ─────────────

  async getThongTinVe(maDatSan: number) {
    const datSan = await this.findDatSanOrFail(maDatSan);
    const lichSan = datSan.lichSan;

    return {
      ...this.buildVeInfo(datSan, lichSan),
      gioBatDau: lichSan.gioBatDau,
      gioKetThuc: lichSan.gioKetThuc,
      coTheCheckIn: datSan.trangThai === 'Đã duyệt',
    };
  }

  // ───────────── E15.3, E15.4, E15.5, E15.7 – Check-in ─────────────

  async checkIn(maDatSan: number) {
    const datSan = await this.findDatSanOrFail(maDatSan);
    this.validateCheckIn(datSan);

    const lichSan = datSan.lichSan;
    const diffMinutes = this.tinhSoPhutTre(lichSan);

    const isOnTime = diffMinutes <= MAX_LATE_MINUTES;
    const trangThaiMoi = isOnTime ? 'Đã check-in' : 'No-show';
    const diemUyTin = isOnTime ? 10 : -10;
    const message = isOnTime
      ? 'Check-in thành công!'
      : `Quá giờ ${diffMinutes} phút (> ${MAX_LATE_MINUTES} phút). Đánh dấu No-show.`;

    datSan.trangThai = trangThaiMoi;
    await this.datSanRepo.save(datSan);

    return {
      ...this.buildVeInfo(datSan, lichSan),
      trangThai: trangThaiMoi,
      diemUyTin,
      message,
    };
  }

  // ───────────── Helpers ─────────────

  private async findDatSanOrFail(maDatSan: number): Promise<DatSan> {
    const datSan = await this.datSanRepo.findOne({
      where: { maDatSan },
      relations: ['lichSan', 'lichSan.sanBai', 'lichSan.sanBai.loaiSan'],
    });
    if (!datSan) {
      throw new NotFoundException('QR không hợp lệ!');
    }
    return datSan;
  }

  private validateCheckIn(datSan: DatSan): void {
    if (datSan.trangThai === 'Đã check-in') {
      throw new BadRequestException(
        'Vé đã được check-in trước đó, không thể check-in lại.',
      );
    }
    if (datSan.trangThai !== 'Đã duyệt') {
      throw new BadRequestException(
        `Không thể check-in. Trạng thái hiện tại: "${datSan.trangThai}". Chỉ vé "Đã duyệt" mới được check-in.`,
      );
    }
  }

  private tinhSoPhutTre(lichSan: LichSan): number {
    const now = new Date();
    const ngayApDung = new Date(lichSan.ngayApDung);
    const [hour, min] = lichSan.gioBatDau.split(':').map(Number);
    const thoiGianBatDau = new Date(ngayApDung);
    thoiGianBatDau.setHours(hour, min, 0, 0);

    const diffMs = now.getTime() - thoiGianBatDau.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  private formatTime(value: string): string {
    return typeof value === 'string'
      ? value.substring(0, 5)
      : new Date(value).toLocaleTimeString('it-IT').substring(0, 5);
  }

  private buildVeInfo(datSan: DatSan, lichSan: LichSan) {
    const sanBai = lichSan?.sanBai;
    return {
      maDatSan: datSan.maDatSan,
      userId: datSan.userId,
      tenSan: sanBai?.tenSan ?? null,
      loaiSan: sanBai?.loaiSan?.tenLoaiSan ?? null,
      ngayApDung: lichSan.ngayApDung,
      khungGio: `${this.formatTime(lichSan.gioBatDau)} - ${this.formatTime(lichSan.gioKetThuc)}`,
      trangThai: datSan.trangThai,
    };
  }
}
