import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LichSanService } from '../lich-san/lich-san.service';
import { SanBaiService } from '../san-bai/san-bai.service';
import { DatSan } from './entities/dat-san.entity';
import { LichSan } from '../lich-san/entities/lich-san.entity';
import { QueryDatSanDto } from './dto/query-dat-san.dto';
import { CreateDatSanThuCongDto } from './dto/create-dat-san-thu-cong.dto';

@Injectable()
export class DatSanService {
  constructor(
    @InjectRepository(DatSan)
    private readonly datSanRepo: Repository<DatSan>,
    @InjectRepository(LichSan)
    private readonly lichSanRepo: Repository<LichSan>,
    private readonly lichSanService: LichSanService,
    private readonly sanBaiService: SanBaiService,
  ) {}

  async findAll(query: QueryDatSanDto): Promise<DatSan[]> {
    const qb = this.datSanRepo
      .createQueryBuilder('ds')
      .leftJoinAndSelect('ds.lichSan', 'ls')
      .leftJoinAndSelect('ls.sanBai', 'sb')
      .leftJoinAndSelect('sb.loaiSan', 'loaiSan');

    if (query.trangThai) {
      qb.andWhere('ds.trangThai = :trangThai', { trangThai: query.trangThai });
    }
    if (query.maSan) {
      qb.andWhere('ls.maSan = :maSan', { maSan: query.maSan });
    }
    if (query.ngay) {
      qb.andWhere('ls.ngayApDung = :ngay', { ngay: query.ngay });
    }

    qb.orderBy('ds.maDatSan', 'DESC');
    return qb.getMany();
  }

  async findOne(id: number): Promise<DatSan> {
    const datSan = await this.datSanRepo.findOne({
      where: { maDatSan: id },
      relations: ['lichSan', 'lichSan.sanBai', 'lichSan.sanBai.loaiSan'],
    });
    if (!datSan) {
      throw new NotFoundException(`Không tìm thấy yêu cầu đặt sân với mã ${id}`);
    }
    return datSan;
  }

  // ───────────── Tạo yêu cầu đặt sân ─────────────

  async create(userId: number, maLichSan: number): Promise<DatSan> {
    const lichSan = await this.lichSanRepo.findOne({
      where: { maLichSan },
      relations: ['sanBai', 'datSan'],
    });
    if (!lichSan) {
      throw new NotFoundException(`Không tìm thấy lịch sân với mã ${maLichSan}`);
    }

    if (lichSan.sanBai?.trangThai === 'Bảo trì') {
      throw new BadRequestException('Sân đang trong trạng thái bảo trì, không thể đặt');
    }

    if (lichSan.datSan) {
      throw new BadRequestException('Lịch sân này đã được đặt');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ngayApDung = new Date(lichSan.ngayApDung);
    if (ngayApDung < today) {
      throw new BadRequestException('Không thể đặt sân cho ngày đã qua');
    }

    const datSan = this.datSanRepo.create({
      userId,
      maLichSan,
      tongTien: lichSan.sanBai?.giaThue ?? null,
      trangThai: 'Chờ duyệt',
    });

    const saved = await this.datSanRepo.save(datSan);
    return this.findOne(saved.maDatSan);
  }

  async createThuCong(dto: CreateDatSanThuCongDto): Promise<DatSan> {
    const { maSan, ngayApDung, gioBatDau, gioKetThuc } = dto;

    const sanBai = await this.sanBaiService.findOne(maSan);
    if (sanBai.trangThai !== 'Hoạt động') {
      throw new BadRequestException(
        `Sân đang ở trạng thái "${sanBai.trangThai}", không thể đặt`,
      );
    }

    if (gioBatDau >= gioKetThuc) {
      throw new BadRequestException('Giờ bắt đầu phải nhỏ hơn giờ kết thúc');
    }

    let lichSan = await this.lichSanRepo.findOne({
      where: { maSan, ngayApDung, gioBatDau, gioKetThuc },
      relations: ['datSan'],
    });

    if (lichSan) {
      if (lichSan.datSan) {
        throw new BadRequestException('Khung giờ này đã được đặt');
      }
    } else {
      lichSan = this.lichSanRepo.create({
        maSan,
        ngayApDung,
        gioBatDau,
        gioKetThuc,
      });
      lichSan = await this.lichSanRepo.save(lichSan);
    }

    const datSan = this.datSanRepo.create({
      userId: dto.userId,
      maLichSan: lichSan.maLichSan,
      tongTien: sanBai.giaThue,
      trangThai: 'Đã duyệt',
    });

    const saved = await this.datSanRepo.save(datSan);
    return this.findOne(saved.maDatSan);
  }

  // ───────────── Duyệt / Từ chối yêu cầu (AC2, AC3) ─────────────

  async duyet(id: number, trangThai: string, nguoiDuyet: number): Promise<DatSan> {
    const datSan = await this.findOne(id);

    if (datSan.trangThai !== 'Chờ duyệt') {
      throw new BadRequestException(
        `Yêu cầu này đã được xử lý (trạng thái hiện tại: ${datSan.trangThai})`,
      );
    }

    datSan.trangThai = trangThai;
    datSan.nguoiDuyet = nguoiDuyet;
    await this.datSanRepo.save(datSan);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const datSan = await this.findOne(id);

    if (datSan.trangThai === 'Đã duyệt') {
      throw new BadRequestException('Không thể hủy yêu cầu đã được duyệt');
    }

    await this.datSanRepo.remove(datSan);
  }

  async getMatrix(dateStr: string, maSan?: number, maLoaiSan?: number) {
    try {
      const now = new Date();
      const lichSans = await this.lichSanService.findAll({
        tuNgay: dateStr,
        denNgay: dateStr,
        maSan: maSan,
      });

      let filteredLich = lichSans;
      if (maLoaiSan) {
        filteredLich = lichSans.filter(
          (lich) => lich.sanBai?.maLoaiSan === Number(maLoaiSan),
        );
      }

      if (!filteredLich || filteredLich.length === 0) {
        throw new NotFoundException(
          `Không có lịch sân cho yêu cầu của bạn vào ngày ${dateStr}`,
        );
      }

      return filteredLich.map((lich) => {
        const timeStartStr =
          typeof lich.gioBatDau === 'string'
            ? lich.gioBatDau
            : new Date(lich.gioBatDau).toLocaleTimeString('it-IT');

        const timeEndStr =
          typeof lich.gioKetThuc === 'string'
            ? lich.gioKetThuc
            : new Date(lich.gioKetThuc).toLocaleTimeString('it-IT');

        const [hour, min] = timeStartStr.split(':');
        const slotStartTime = new Date(dateStr);
        slotStartTime.setHours(Number(hour), Number(min), 0, 0);

        let finalStatus = 'Trống';

        if (lich.sanBai?.trangThai === 'Bảo trì') {
          finalStatus = 'Bảo trì';
        } else if (slotStartTime < now) {
          finalStatus = 'Quá giờ';
        } else if (lich.datSan) {
          finalStatus = 'Đã đặt';
        }

        return {
          maLich: lich.maLichSan,
          tenSan: lich.sanBai?.tenSan,
          loaiSan: lich.sanBai?.loaiSan?.tenLoaiSan,
          khungGio: `${timeStartStr.substring(0, 5)} - ${timeEndStr.substring(0, 5)}`,
          trangThai: finalStatus,
          giaThue: lich.sanBai?.giaThue,
          canBook: finalStatus === 'Trống',
        };
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Lỗi logic US-08:', error);
      throw new InternalServerErrorException('Lỗi hệ thống khi xử lý ma trận lịch');
    }
  }

  async getLichSu(maNguoiDung: number) {
    try {
      const lichSu = await this.lichSanService.findAll({});
      const result = lichSu
        .filter((lich) => lich.datSan?.maNguoiDung === maNguoiDung)
        .map((lich) => {
          const timeStartStr =
            typeof lich.gioBatDau === 'string'
              ? lich.gioBatDau
              : new Date(lich.gioBatDau).toLocaleTimeString('it-IT');

          const timeEndStr =
            typeof lich.gioKetThuc === 'string'
              ? lich.gioKetThuc
              : new Date(lich.gioKetThuc).toLocaleTimeString('it-IT');

          return {
            maDatSan: lich.datSan?.maDatSan,
            tenSan: lich.sanBai?.tenSan,
            loaiSan: lich.sanBai?.loaiSan?.tenLoaiSan,
            ngayDat: lich.datSan?.ngayDat,
            ngayApDung: lich.ngayApDung,
            khungGio: `${timeStartStr.substring(0, 5)} - ${timeEndStr.substring(0, 5)}`,
            trangThai: lich.datSan?.trangThai,
            giaThue: lich.sanBai?.giaThue,
          };
        });

      if (result.length === 0) {
        throw new NotFoundException(
          `Không tìm thấy lịch sử đặt sân cho người dùng ${maNguoiDung}`,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Lỗi logic US-11:', error);
      throw new InternalServerErrorException(`Lỗi hệ thống: ${error.message}`);
    }
  }
}