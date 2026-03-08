import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SanBai } from './entities/san-bai.entity';
import { LoaiSan } from './entities/loai-san.entity';
import { CreateSanBaiDto } from './dto/create-san-bai.dto';
import { UpdateSanBaiDto } from './dto/update-san-bai.dto';
import { QuerySanBaiDto } from './dto/query-san-bai.dto';
import { DatSan } from '../lich-san/entities/dat-san.entity';

@Injectable()
export class SanBaiService {
  constructor(
    @InjectRepository(SanBai)
    private readonly sanBaiRepo: Repository<SanBai>,
    @InjectRepository(LoaiSan)
    private readonly loaiSanRepo: Repository<LoaiSan>,
  ) {}

  // ───────────── Query ─────────────

  async findAll(query: QuerySanBaiDto): Promise<SanBai[]> {
    const qb = this.sanBaiRepo
      .createQueryBuilder('sb')
      .leftJoinAndSelect('sb.loaiSan', 'loaiSan');

    if (query.tenSan) {
      qb.andWhere('sb.tenSan LIKE :tenSan', { tenSan: `%${query.tenSan}%` });
    }
    if (query.maLoaiSan) {
      qb.andWhere('sb.maLoaiSan = :maLoaiSan', { maLoaiSan: query.maLoaiSan });
    }
    if (query.trangThai) {
      qb.andWhere('sb.trangThai = :trangThai', { trangThai: query.trangThai });
    }

    qb.orderBy('sb.maSan', 'ASC');
    return qb.getMany();
  }

  async findOne(id: number): Promise<SanBai> {
    const sanBai = await this.sanBaiRepo.findOne({
      where: { maSan: id },
      relations: ['loaiSan'],
    });
    if (!sanBai) {
      throw new NotFoundException(`Không tìm thấy sân với mã ${id}`);
    }
    return sanBai;
  }

  // ───────────── Loại sân ─────────────

  async findAllLoaiSan(): Promise<LoaiSan[]> {
    return this.loaiSanRepo.find({ order: { tenLoaiSan: 'ASC' } });
  }

  // ───────────── Create ─────────────

  async create(
    dto: CreateSanBaiDto,
    hinhAnhPath?: string,
  ): Promise<SanBai> {
    // Validate loại sân tồn tại
    await this.validateLoaiSan(dto.maLoaiSan);

    const sanBai = new SanBai();
    sanBai.tenSan = dto.tenSan;
    sanBai.maLoaiSan = dto.maLoaiSan;
    sanBai.giaThue = dto.giaThue;
    sanBai.viTri = dto.viTri || null;
    sanBai.trangThai = dto.trangThai || 'Hoạt động';
    sanBai.hinhAnh = hinhAnhPath || null;

    const saved = await this.sanBaiRepo.save(sanBai);
    return this.findOne(saved.maSan);
  }

  // ───────────── Update ─────────────

  async update(
    id: number,
    dto: UpdateSanBaiDto,
    hinhAnhPath?: string,
  ): Promise<SanBai> {
    const sanBai = await this.findOne(id);

    // Validate loại sân nếu có thay đổi
    if (dto.maLoaiSan) {
      await this.validateLoaiSan(dto.maLoaiSan);
    }

    if (dto.tenSan !== undefined) sanBai.tenSan = dto.tenSan;
    if (dto.maLoaiSan !== undefined) sanBai.maLoaiSan = dto.maLoaiSan;
    if (dto.giaThue !== undefined) sanBai.giaThue = dto.giaThue;
    if (dto.viTri !== undefined) sanBai.viTri = dto.viTri;
    if (dto.trangThai !== undefined) sanBai.trangThai = dto.trangThai;
    if (hinhAnhPath) sanBai.hinhAnh = hinhAnhPath;

    const saved = await this.sanBaiRepo.save(sanBai);
    return this.findOne(saved.maSan);
  }

  // ───────────── Delete (AC8) ─────────────

  async remove(id: number): Promise<void> {
    const sanBai = await this.findOne(id);

    // Không cho xóa sân đã có lịch được đặt.
    const lichDaDat = await this.sanBaiRepo.manager
      .createQueryBuilder(DatSan, 'ds')
      .innerJoin('LichSan', 'ls', 'ls.MaLichSan = ds.MaLichSan')
      .where('ls.MaSan = :maSan', { maSan: id })
      .getCount();

    if (lichDaDat > 0) {
      throw new BadRequestException(
        'Không thể xóa sân đang có lịch đặt',
      );
    }

    // Xóa tất cả lịch sân chưa có đặt sân trước khi xóa sân.
    const danhSachLich = await this.sanBaiRepo.manager
      .createQueryBuilder()
      .select('ls.MaLichSan', 'maLichSan')
      .from('LichSan', 'ls')
      .where('ls.MaSan = :maSan', { maSan: id })
      .getRawMany<{ maLichSan: number }>();

    const ids = danhSachLich.map((item) => item.maLichSan);
    if (ids.length > 0) {
      const lichDaDat = await this.sanBaiRepo.manager.find(DatSan, {
        where: { maLichSan: In(ids) },
        select: ['maLichSan'],
      });
      const bookedSet = new Set(lichDaDat.map((item) => item.maLichSan));
      const idsCoTheXoa = ids.filter((lichId) => !bookedSet.has(lichId));

      if (idsCoTheXoa.length > 0) {
        await this.sanBaiRepo.manager
          .createQueryBuilder()
          .delete()
          .from('LichSan')
          .where('MaLichSan IN (:...ids)', { ids: idsCoTheXoa })
          .execute();
      }
    }

    await this.sanBaiRepo.remove(sanBai);
  }

  // ───────────── Cập nhật trạng thái bảo trì (AC7) ─────────────

  async updateTrangThai(id: number, trangThai: string): Promise<SanBai> {
    const sanBai = await this.findOne(id);

    if (!['Hoạt động', 'Bảo trì', 'Không hoạt động'].includes(trangThai)) {
      throw new BadRequestException(
        "Trạng thái phải là 'Hoạt động', 'Bảo trì' hoặc 'Không hoạt động'",
      );
    }

    sanBai.trangThai = trangThai;
    return this.sanBaiRepo.save(sanBai);
  }

  // ───────────── Helpers ─────────────

  private async validateLoaiSan(maLoaiSan: number): Promise<void> {
    const loaiSan = await this.loaiSanRepo.findOne({
      where: { maLoaiSan },
    });
    if (!loaiSan) {
      throw new NotFoundException(
        `Không tìm thấy loại sân với mã ${maLoaiSan}`,
      );
    }
  }
}
