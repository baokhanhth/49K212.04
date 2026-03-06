import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LichSan } from './entities/lich-san.entity';
import { CreateLichSanDto } from './dto/create-lich-san.dto';
import { GenerateLichSanDto } from './dto/generate-lich-san.dto';
import { QueryLichSanDto } from './dto/query-lich-san.dto';
import { ToggleLichSanDto } from './dto/toggle-lich-san.dto';
import { KhoaLichSanDto } from './dto/khoa-lich-san.dto';
import { SanBai } from '../san-bai/entities/san-bai.entity';
import { KhungGio } from '../khung-gio/entities/khung-gio.entity';
import { CauHinhService } from '../cau-hinh/cau-hinh.service';

@Injectable()
export class LichSanService {
  constructor(
    @InjectRepository(LichSan)
    private readonly lichSanRepo: Repository<LichSan>,
    @InjectRepository(SanBai)
    private readonly sanBaiRepo: Repository<SanBai>,
    @InjectRepository(KhungGio)
    private readonly khungGioRepo: Repository<KhungGio>,
    private readonly cauHinhService: CauHinhService,
  ) {}

  // ───────────── Query ─────────────

  async findAll(query: QueryLichSanDto, excludeKhoa = false): Promise<LichSan[]> {
    const qb = this.lichSanRepo
      .createQueryBuilder('ls')
      .leftJoinAndSelect('ls.sanBai', 'sb')
      .leftJoinAndSelect('sb.loaiSan', 'loaiSan')
      .leftJoinAndSelect('ls.khungGio', 'kg');

    if (query.maSan) {
      qb.andWhere('ls.maSan = :maSan', { maSan: query.maSan });
    }
    if (query.tuNgay) {
      qb.andWhere('ls.ngayApDung >= :tuNgay', { tuNgay: query.tuNgay });
    }
    if (query.denNgay) {
      qb.andWhere('ls.ngayApDung <= :denNgay', { denNgay: query.denNgay });
    }
    if (query.maKhungGio) {
      qb.andWhere('ls.maKhungGio = :maKhungGio', {
        maKhungGio: query.maKhungGio,
      });
    }
    if (query.trangThai === 'trong') {
      qb.andWhere('ls.maDatSan IS NULL');
    } else if (query.trangThai === 'da_dat') {
      qb.andWhere('ls.maDatSan IS NOT NULL');
    }

    // Lọc bỏ lịch bị khoá (dành cho sinh viên)
    if (excludeKhoa) {
      qb.andWhere('ls.biKhoa = :biKhoa', { biKhoa: false });
    }

    qb.orderBy('ls.ngayApDung', 'ASC').addOrderBy('kg.gioBatDau', 'ASC');

    return qb.getMany();
  }

  /**
   * Lấy danh sách lịch sân CHO SINH VIÊN (chỉ trong khoảng cho phép đặt).
   * Frontend sinh viên nên gọi API này thay vì findAll.
   */
  async findAllChoSinhVien(query: QueryLichSanDto): Promise<LichSan[]> {
    const thongTin = await this.cauHinhService.getThongTinDatSan();

    // Ép khoảng ngày vào phạm vi cho phép
    const tuNgay =
      query.tuNgay && query.tuNgay > thongTin.ngayBatDau
        ? query.tuNgay
        : thongTin.ngayBatDau;

    const denNgay =
      query.denNgay && query.denNgay < thongTin.ngayKetThuc
        ? query.denNgay
        : thongTin.ngayKetThuc;

    return this.findAll({
      ...query,
      tuNgay,
      denNgay,
      trangThai: 'trong', // Sinh viên chỉ thấy lịch trống
    }, true);
  }

  async findOne(id: number): Promise<LichSan> {
    const lichSan = await this.lichSanRepo.findOne({
      where: { maLichSan: id },
      relations: ['sanBai', 'sanBai.loaiSan', 'khungGio'],
    });
    if (!lichSan) {
      throw new NotFoundException(`Không tìm thấy lịch sân với mã ${id}`);
    }
    return lichSan;
  }

  // ───────────── Create ─────────────

  async create(dto: CreateLichSanDto): Promise<LichSan> {
    // Validate sân tồn tại
    await this.validateSanBai(dto.maSan);
    // Validate khung giờ tồn tại
    await this.validateKhungGio(dto.maKhungGio);
    // Validate ngày không quá khứ
    this.validateNgayKhongQuaKhu(dto.ngayApDung);

    // Kiểm tra trùng lặp
    const existing = await this.lichSanRepo.findOne({
      where: {
        maSan: dto.maSan,
        ngayApDung: dto.ngayApDung,
        maKhungGio: dto.maKhungGio,
      },
    });
    if (existing) {
      throw new BadRequestException(
        `Lịch sân đã tồn tại cho sân ${dto.maSan}, ngày ${dto.ngayApDung}, khung giờ ${dto.maKhungGio}`,
      );
    }

    const lichSan = this.lichSanRepo.create(dto);
    return this.lichSanRepo.save(lichSan);
  }

  // ───────────── Generate (batch) ─────────────

  async generate(
    dto: GenerateLichSanDto,
  ): Promise<{ created: number; skipped: number }> {
    // Validate sân
    await this.validateSanBai(dto.maSan);

    // Validate ngày
    if (dto.tuNgay > dto.denNgay) {
      throw new BadRequestException('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
    }
    this.validateNgayKhongQuaKhu(dto.tuNgay);

    // Validate khoảng <= 90 ngày
    const start = new Date(dto.tuNgay);
    const end = new Date(dto.denNgay);
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff > 90) {
      throw new BadRequestException('Khoảng thời gian tối đa là 90 ngày');
    }

    // Validate tất cả khung giờ
    for (const maKhungGio of dto.danhSachKhungGio) {
      await this.validateKhungGio(maKhungGio);
    }

    let created = 0;
    let skipped = 0;

    const current = new Date(dto.tuNgay);
    const endDate = new Date(dto.denNgay);

    while (current <= endDate) {
      const ngay = this.formatDate(current);

      for (const maKhungGio of dto.danhSachKhungGio) {
        const existing = await this.lichSanRepo.findOne({
          where: { maSan: dto.maSan, ngayApDung: ngay, maKhungGio },
        });

        if (existing) {
          skipped++;
        } else {
          const lichSan = this.lichSanRepo.create({
            maSan: dto.maSan,
            ngayApDung: ngay,
            maKhungGio,
          });
          await this.lichSanRepo.save(lichSan);
          created++;
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return { created, skipped };
  }

  // ───────────── Toggle ─────────────

  /**
   * Khoá/mở khoá lịch sân cho sinh viên.
   * Khi khoá: lịch vẫn tồn tại nhưng sinh viên không thấy và không đặt được.
   * Khi mở khoá: sinh viên thấy lại và đặt được bình thường.
   */
  async khoaLichSan(
    dto: KhoaLichSanDto,
  ): Promise<{ message: string; affected: number }> {
    await this.validateSanBai(dto.maSan);

    let affected = 0;

    for (const maKhungGio of dto.danhSachKhungGio) {
      const lichSan = await this.lichSanRepo.findOne({
        where: {
          maSan: dto.maSan,
          ngayApDung: dto.ngayApDung,
          maKhungGio,
        },
      });

      if (!lichSan) {
        continue; // Lịch không tồn tại, bỏ qua
      }

      if (dto.khoa && lichSan.maDatSan) {
        // Không khoá lịch đã được đặt
        continue;
      }

      lichSan.biKhoa = dto.khoa;
      lichSan.lyDoKhoa = dto.khoa ? (dto.lyDoKhoa || null) : null;
      await this.lichSanRepo.save(lichSan);
      affected++;
    }

    const action = dto.khoa ? 'khoá' : 'mở khoá';
    return {
      message: `Đã ${action} ${affected} khung giờ cho sân ${dto.maSan} ngày ${dto.ngayApDung}`,
      affected,
    };
  }

  async toggleDate(
    dto: ToggleLichSanDto,
  ): Promise<{ message: string; affected: number }> {
    await this.validateSanBai(dto.maSan);

    let affected = 0;

    if (dto.moLich) {
      // Mở: tạo lịch cho khung giờ chưa có
      for (const maKhungGio of dto.danhSachKhungGio) {
        const existing = await this.lichSanRepo.findOne({
          where: {
            maSan: dto.maSan,
            ngayApDung: dto.ngayApDung,
            maKhungGio,
          },
        });
        if (!existing) {
          const lichSan = this.lichSanRepo.create({
            maSan: dto.maSan,
            ngayApDung: dto.ngayApDung,
            maKhungGio,
          });
          await this.lichSanRepo.save(lichSan);
          affected++;
        }
      }
      return {
        message: `Đã mở ${affected} khung giờ cho sân ${dto.maSan} ngày ${dto.ngayApDung}`,
        affected,
      };
    } else {
      // Đóng: xóa lịch chưa đặt
      for (const maKhungGio of dto.danhSachKhungGio) {
        const result = await this.lichSanRepo
          .createQueryBuilder()
          .delete()
          .where('maSan = :maSan', { maSan: dto.maSan })
          .andWhere('ngayApDung = :ngayApDung', {
            ngayApDung: dto.ngayApDung,
          })
          .andWhere('maKhungGio = :maKhungGio', { maKhungGio })
          .andWhere('maDatSan IS NULL')
          .execute();
        affected += result.affected || 0;
      }
      return {
        message: `Đã đóng ${affected} khung giờ cho sân ${dto.maSan} ngày ${dto.ngayApDung}`,
        affected,
      };
    }
  }

  // ───────────── Delete ─────────────

  async remove(id: number): Promise<void> {
    const lichSan = await this.findOne(id);
    if (lichSan.maDatSan) {
      throw new BadRequestException('Không thể xóa lịch sân đã có đặt sân');
    }
    await this.lichSanRepo.remove(lichSan);
  }

  async removeByDate(
    maSan: number,
    ngayApDung: string,
  ): Promise<{ deleted: number }> {
    const result = await this.lichSanRepo
      .createQueryBuilder()
      .delete()
      .where('maSan = :maSan', { maSan })
      .andWhere('ngayApDung = :ngayApDung', { ngayApDung })
      .andWhere('maDatSan IS NULL')
      .execute();

    if (!result.affected) {
      throw new NotFoundException(
        `Không tìm thấy lịch sân trống cho sân ${maSan} ngày ${ngayApDung}`,
      );
    }

    return { deleted: result.affected };
  }

  // ───────────── Validation helpers ─────────────

  private async validateSanBai(maSan: number): Promise<SanBai> {
    const san = await this.sanBaiRepo.findOne({ where: { maSan } });
    if (!san) {
      throw new NotFoundException(`Không tìm thấy sân với mã ${maSan}`);
    }
    return san;
  }

  private async validateKhungGio(maKhungGio: number): Promise<KhungGio> {
    const kg = await this.khungGioRepo.findOne({ where: { maKhungGio } });
    if (!kg) {
      throw new NotFoundException(
        `Không tìm thấy khung giờ với mã ${maKhungGio}`,
      );
    }
    return kg;
  }

  private validateNgayKhongQuaKhu(ngay: string): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(ngay);
    target.setHours(0, 0, 0, 0);
    if (target < today) {
      throw new BadRequestException(
        `Ngày ${ngay} đã trong quá khứ, không thể tạo lịch`,
      );
    }
  }

  /**
   * Validate ngày đặt sân cho SINH VIÊN.
   * Gọi hàm này khi sinh viên đặt sân để kiểm tra ngày có nằm
   * trong khoảng [hôm nay, hôm nay + max_day] không.
   */
  async validateNgayDatSanChoSinhVien(ngayApDung: string): Promise<void> {
    await this.cauHinhService.validateNgayDatSan(ngayApDung);
  }

  /**
   * Kiểm tra lịch sân có bị khoá không.
   * Gọi khi sinh viên đặt sân để chận đặt vào slot bị khoá.
   */
  async validateKhongBiKhoa(
    maSan: number,
    ngayApDung: string,
    maKhungGio: number,
  ): Promise<void> {
    const lichSan = await this.lichSanRepo.findOne({
      where: { maSan, ngayApDung, maKhungGio },
    });

    if (lichSan && lichSan.biKhoa) {
      const lyDo = lichSan.lyDoKhoa
        ? ` Lý do: ${lichSan.lyDoKhoa}`
        : '';
      throw new BadRequestException(
        `Lịch sân ngày ${ngayApDung} khung giờ ${maKhungGio} đã bị khoá, không thể đặt sân.${lyDo}`,
      );
    }
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
