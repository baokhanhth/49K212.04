import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LichSan } from './entities/lich-san.entity';
import { DatSan } from './entities/dat-san.entity';
import { CreateLichSanDto } from './dto/create-lich-san.dto';
import { GenerateLichSanDto } from './dto/generate-lich-san.dto';
import { QueryLichSanDto } from './dto/query-lich-san.dto';
import { ToggleLichSanDto } from './dto/toggle-lich-san.dto';
import { SanBai } from '../san-bai/entities/san-bai.entity';

@Injectable()
export class LichSanService {
  constructor(
    @InjectRepository(LichSan)
    private readonly lichSanRepo: Repository<LichSan>,
    @InjectRepository(SanBai)
    private readonly sanBaiRepo: Repository<SanBai>,
    @InjectRepository(DatSan)
    private readonly datSanRepo: Repository<DatSan>,
  ) {}

  async findAll(query: QueryLichSanDto): Promise<LichSan[]> {
    const qb = this.lichSanRepo
      .createQueryBuilder('ls')
      .leftJoinAndSelect('ls.sanBai', 'sb')
      .leftJoinAndSelect('sb.loaiSan', 'loaiSan')
      .leftJoinAndSelect('ls.datSan', 'ds');

    if (query.maSan) {
      qb.andWhere('ls.maSan = :maSan', { maSan: query.maSan });
    }
    if (query.tuNgay) {
      qb.andWhere('ls.ngayApDung >= :tuNgay', { tuNgay: query.tuNgay });
    }
    if (query.denNgay) {
      qb.andWhere('ls.ngayApDung <= :denNgay', { denNgay: query.denNgay });
    }
    if (query.gioBatDau) {
      qb.andWhere('ls.gioBatDau = :gioBatDau', { gioBatDau: query.gioBatDau });
    }
    if (query.gioKetThuc) {
      qb.andWhere('ls.gioKetThuc = :gioKetThuc', { gioKetThuc: query.gioKetThuc });
    }
    if (query.trangThai === 'trong') {
      qb.andWhere('ds.maDatSan IS NULL');
    } else if (query.trangThai === 'da_dat') {
      qb.andWhere('ds.maDatSan IS NOT NULL');
    }

    qb.orderBy('ls.ngayApDung', 'ASC').addOrderBy('ls.gioBatDau', 'ASC');

    return qb.getMany();
  }

  async findOne(id: number): Promise<LichSan> {
    const lichSan = await this.lichSanRepo.findOne({
      where: { maLichSan: id },
      relations: ['sanBai', 'sanBai.loaiSan', 'datSan'],
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
    // Validate ngày không quá khứ
    this.validateNgayKhongQuaKhu(dto.ngayApDung);
    this.validateTimeRange(dto.gioBatDau, dto.gioKetThuc);
    // Normalize HH:mm → HH:mm:ss for mssql time type
    dto.gioBatDau = this.normalizeTime(dto.gioBatDau);
    dto.gioKetThuc = this.normalizeTime(dto.gioKetThuc);

    // Kiểm tra trùng lặp
    const existing = await this.lichSanRepo.findOne({
      where: {
        maSan: dto.maSan,
        ngayApDung: dto.ngayApDung,
        gioBatDau: dto.gioBatDau,
        gioKetThuc: dto.gioKetThuc,
      },
    });
    if (existing) {
      throw new BadRequestException(
        `Lịch sân đã tồn tại cho sân ${dto.maSan}, ngày ${dto.ngayApDung}, khung ${dto.gioBatDau}-${dto.gioKetThuc}`,
      );
    }

    const lichSan = this.lichSanRepo.create(dto);
    return this.lichSanRepo.save(lichSan);
  }

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

    // Validate tất cả khung giờ và normalize
    for (const khungGio of dto.danhSachKhungGio) {
      this.validateTimeRange(khungGio.gioBatDau, khungGio.gioKetThuc);
      khungGio.gioBatDau = this.normalizeTime(khungGio.gioBatDau);
      khungGio.gioKetThuc = this.normalizeTime(khungGio.gioKetThuc);
    }

    let created = 0;
    let skipped = 0;

    const current = new Date(dto.tuNgay);
    const endDate = new Date(dto.denNgay);

    while (current <= endDate) {
      const ngay = this.formatDate(current);

      for (const maKhungGio of dto.danhSachKhungGio) {
        const existing = await this.lichSanRepo.findOne({
          where: {
            maSan: dto.maSan,
            ngayApDung: ngay,
            gioBatDau: maKhungGio.gioBatDau,
            gioKetThuc: maKhungGio.gioKetThuc,
          },
        });

        if (existing) {
          skipped++;
        } else {
          const lichSan = this.lichSanRepo.create({
            maSan: dto.maSan,
            ngayApDung: ngay,
            gioBatDau: maKhungGio.gioBatDau,
            gioKetThuc: maKhungGio.gioKetThuc,
          });
          await this.lichSanRepo.save(lichSan);
          created++;
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return { created, skipped };
  }

  async toggleDate(
    dto: ToggleLichSanDto,
  ): Promise<{ message: string; affected: number }> {
    await this.validateSanBai(dto.maSan);

    let affected = 0;

    if (dto.moLich) {
      // Mở: tạo lịch cho khung giờ chưa có
      for (const maKhungGio of dto.danhSachKhungGio) {
        this.validateTimeRange(maKhungGio.gioBatDau, maKhungGio.gioKetThuc);
        maKhungGio.gioBatDau = this.normalizeTime(maKhungGio.gioBatDau);
        maKhungGio.gioKetThuc = this.normalizeTime(maKhungGio.gioKetThuc);

        const existing = await this.lichSanRepo.findOne({
          where: {
            maSan: dto.maSan,
            ngayApDung: dto.ngayApDung,
            gioBatDau: maKhungGio.gioBatDau,
            gioKetThuc: maKhungGio.gioKetThuc,
          },
        });
        if (!existing) {
          const lichSan = this.lichSanRepo.create({
            maSan: dto.maSan,
            ngayApDung: dto.ngayApDung,
            gioBatDau: maKhungGio.gioBatDau,
            gioKetThuc: maKhungGio.gioKetThuc,
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
        this.validateTimeRange(maKhungGio.gioBatDau, maKhungGio.gioKetThuc);
        maKhungGio.gioBatDau = this.normalizeTime(maKhungGio.gioBatDau);
        maKhungGio.gioKetThuc = this.normalizeTime(maKhungGio.gioKetThuc);

        const lichSan = await this.lichSanRepo.findOne({
          where: {
            maSan: dto.maSan,
            ngayApDung: dto.ngayApDung,
            gioBatDau: maKhungGio.gioBatDau,
            gioKetThuc: maKhungGio.gioKetThuc,
          },
          select: ['maLichSan'],
        });

        if (!lichSan) {
          continue;
        }

        const daDat = await this.datSanRepo.exist({
          where: { maLichSan: lichSan.maLichSan },
        });
        if (daDat) {
          continue;
        }

        await this.lichSanRepo.delete({ maLichSan: lichSan.maLichSan });
        affected++;
      }
      return {
        message: `Đã đóng ${affected} khung giờ cho sân ${dto.maSan} ngày ${dto.ngayApDung}`,
        affected,
      };
    }
  }

  async remove(id: number): Promise<void> {
    const lichSan = await this.findOne(id);
    const daDat = await this.datSanRepo.findOne({
      where: { maLichSan: lichSan.maLichSan },
    });
    if (daDat) {
      throw new BadRequestException('Không thể xóa lịch sân đã có đặt sân');
    }
    await this.lichSanRepo.remove(lichSan);
  }

  async removeByDate(
    maSan: number,
    ngayApDung: string,
  ): Promise<{ deleted: number }> {
    const danhSachLich = await this.lichSanRepo.find({
      where: { maSan, ngayApDung },
      select: ['maLichSan'],
    });

    if (danhSachLich.length === 0) {
      throw new NotFoundException(
        `Không tìm thấy lịch sân trống cho sân ${maSan} ngày ${ngayApDung}`,
      );
    }

    const ids = danhSachLich.map((item) => item.maLichSan);
    const lichDaDat = await this.datSanRepo.find({
      where: { maLichSan: In(ids) },
      select: ['maLichSan'],
    });
    const bookedSet = new Set(lichDaDat.map((item) => item.maLichSan));
    const idsCoTheXoa = ids.filter((id) => !bookedSet.has(id));

    if (idsCoTheXoa.length === 0) {
      throw new NotFoundException(
        `Không tìm thấy lịch sân trống cho sân ${maSan} ngày ${ngayApDung}`,
      );
    }

    const result = await this.lichSanRepo.delete({ maLichSan: In(idsCoTheXoa) });

    if (!result.affected) {
      throw new NotFoundException(
        `Không tìm thấy lịch sân trống cho sân ${maSan} ngày ${ngayApDung}`,
      );
    }

    return { deleted: result.affected };
  }

  private async validateSanBai(maSan: number): Promise<SanBai> {
    const san = await this.sanBaiRepo.findOne({ where: { maSan } });
    if (!san) {
      throw new NotFoundException(`Không tìm thấy sân với mã ${maSan}`);
    }
    return san;
  }

  private validateTimeRange(gioBatDau: string, gioKetThuc: string): void {
    const from = this.normalizeTime(gioBatDau);
    const to = this.normalizeTime(gioKetThuc);

    if (from >= to) {
      throw new BadRequestException('Giờ bắt đầu phải nhỏ hơn giờ kết thúc');
    }
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

  private normalizeTime(value: string): string {
    return value.length === 5 ? `${value}:00` : value;
  }

  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
