import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';
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

    private readonly dataSource: DataSource,
  ) { }

  // ================== ⭐ GỌI PROCEDURE ==================
  async taoLichTuDong(): Promise<void> {
    try {
      console.log('⏰ [CRON] Đang tạo lịch sân tự động...');

      await this.dataSource.query(`
        EXEC sp_TaoLichSanTuDong
      `);

      console.log('✅ [CRON] Tạo lịch sân thành công');
    } catch (error) {
      console.error('❌ [CRON] Lỗi tạo lịch sân:', error);
    }
  }

  // ================== FIND ==================

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

  // ================== CREATE ==================

  async create(dto: CreateLichSanDto): Promise<LichSan> {
    await this.validateSanBai(dto.maSan);
    this.validateNgayKhongQuaKhu(dto.ngayApDung);
    this.validateTimeRange(dto.gioBatDau, dto.gioKetThuc);

    dto.gioBatDau = this.normalizeTime(dto.gioBatDau);
    dto.gioKetThuc = this.normalizeTime(dto.gioKetThuc);

    const existing = await this.lichSanRepo.findOne({
      where: {
        maSan: dto.maSan,
        ngayApDung: dto.ngayApDung,
        gioBatDau: dto.gioBatDau,
        gioKetThuc: dto.gioKetThuc,
      },
    });

    if (existing) {
      throw new BadRequestException('Lịch đã tồn tại');
    }

    const lichSan = this.lichSanRepo.create(dto);
    return this.lichSanRepo.save(lichSan);
  }

  // ================== GENERATE ==================

  async generate(
    dto: GenerateLichSanDto,
  ): Promise<{ created: number; skipped: number }> {
    await this.validateSanBai(dto.maSan);

    if (dto.tuNgay > dto.denNgay) {
      throw new BadRequestException('Ngày không hợp lệ');
    }

    this.validateNgayKhongQuaKhu(dto.tuNgay);

    let created = 0;
    let skipped = 0;

    const current = new Date(dto.tuNgay);
    const endDate = new Date(dto.denNgay);

    while (current <= endDate) {
      const ngay = this.formatDate(current);

      for (const khung of dto.danhSachKhungGio) {
        khung.gioBatDau = this.normalizeTime(khung.gioBatDau);
        khung.gioKetThuc = this.normalizeTime(khung.gioKetThuc);

        const exists = await this.lichSanRepo.findOne({
          where: {
            maSan: dto.maSan,
            ngayApDung: ngay,
            gioBatDau: khung.gioBatDau,
            gioKetThuc: khung.gioKetThuc,
          },
        });

        if (exists) skipped++;
        else {
          await this.lichSanRepo.save({
            maSan: dto.maSan,
            ngayApDung: ngay,
            gioBatDau: khung.gioBatDau,
            gioKetThuc: khung.gioKetThuc,
          });
          created++;
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return { created, skipped };
  }

  // ================== ⭐ TOGGLE DATE (FIX LỖI) ==================

  async toggleDate(
    dto: ToggleLichSanDto,
  ): Promise<{ message: string; affected: number }> {
    await this.validateSanBai(dto.maSan);

    let affected = 0;

    if (dto.moLich) {
      // MỞ lịch
      for (const khungGio of dto.danhSachKhungGio) {
        this.validateTimeRange(khungGio.gioBatDau, khungGio.gioKetThuc);

        khungGio.gioBatDau = this.normalizeTime(khungGio.gioBatDau);
        khungGio.gioKetThuc = this.normalizeTime(khungGio.gioKetThuc);

        const existing = await this.lichSanRepo.findOne({
          where: {
            maSan: dto.maSan,
            ngayApDung: dto.ngayApDung,
            gioBatDau: khungGio.gioBatDau,
            gioKetThuc: khungGio.gioKetThuc,
          },
        });

        if (!existing) {
          const lichSan = this.lichSanRepo.create({
            maSan: dto.maSan,
            ngayApDung: dto.ngayApDung,
            gioBatDau: khungGio.gioBatDau,
            gioKetThuc: khungGio.gioKetThuc,
          });

          await this.lichSanRepo.save(lichSan);
          affected++;
        }
      }

      return {
        message: `Đã mở ${affected} khung giờ`,
        affected,
      };
    } else {
      // ĐÓNG lịch
      for (const khungGio of dto.danhSachKhungGio) {
        this.validateTimeRange(khungGio.gioBatDau, khungGio.gioKetThuc);

        khungGio.gioBatDau = this.normalizeTime(khungGio.gioBatDau);
        khungGio.gioKetThuc = this.normalizeTime(khungGio.gioKetThuc);

        const lichSan = await this.lichSanRepo.findOne({
          where: {
            maSan: dto.maSan,
            ngayApDung: dto.ngayApDung,
            gioBatDau: khungGio.gioBatDau,
            gioKetThuc: khungGio.gioKetThuc,
          },
          select: ['maLichSan'],
        });

        if (!lichSan) continue;

        const daDat = await this.datSanRepo.exist({
          where: { maLichSan: lichSan.maLichSan },
        });

        if (daDat) continue;

        await this.lichSanRepo.delete({ maLichSan: lichSan.maLichSan });
        affected++;
      }

      return {
        message: `Đã đóng ${affected} khung giờ`,
        affected,
      };
    }
  }

  // ================== REMOVE ==================

  async remove(id: number): Promise<void> {
    const lichSan = await this.findOne(id);

    const daDat = await this.datSanRepo.findOne({
      where: { maLichSan: lichSan.maLichSan },
    });

    if (daDat) {
      throw new BadRequestException('Đã có người đặt');
    }

    await this.lichSanRepo.remove(lichSan);
  }

  async removeByDate(
    maSan: number,
    ngayApDung: string,
  ): Promise<{ deleted: number }> {
    const danhSach = await this.lichSanRepo.find({
      where: { maSan, ngayApDung },
      select: ['maLichSan'],
    });

    if (!danhSach.length) {
      throw new NotFoundException('Không có lịch để xóa');
    }

    const ids = danhSach.map((x) => x.maLichSan);

    const daDat = await this.datSanRepo.find({
      where: { maLichSan: In(ids) },
      select: ['maLichSan'],
    });

    const booked = new Set(daDat.map((x) => x.maLichSan));
    const canXoa = ids.filter((id) => !booked.has(id));

    if (!canXoa.length) {
      throw new NotFoundException('Không có lịch trống để xóa');
    }

    const result = await this.lichSanRepo.delete({
      maLichSan: In(canXoa),
    });

    return { deleted: result.affected || 0 };
  }

  // ================== HELPER ==================

  private async validateSanBai(maSan: number): Promise<SanBai> {
    const san = await this.sanBaiRepo.findOne({ where: { maSan } });
    if (!san) throw new NotFoundException('Không tìm thấy sân');
    return san;
  }

  private validateTimeRange(gioBatDau: string, gioKetThuc: string): void {
    if (gioBatDau >= gioKetThuc) {
      throw new BadRequestException('Giờ không hợp lệ');
    }
  }

  private validateNgayKhongQuaKhu(ngay: string): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(ngay);
    target.setHours(0, 0, 0, 0);

    if (target < today) {
      throw new BadRequestException('Ngày đã qua');
    }
  }

  private normalizeTime(value: string): string {
    return value.length === 5 ? `${value}:00` : value;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}