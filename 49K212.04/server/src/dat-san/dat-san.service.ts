import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { DatSan } from "./entities/dat-san.entity";
import { CreateDatSanDto } from "./dto/create-dat-san.dto";
import { LichSan } from "@/lich-san/entities/lich-san.entity";
import { SanBai } from "@/san-bai/entities/san-bai.entity";
import { ChiTietDatSan } from '@/chi-tiet-dat-san/entities/chi-tiet-dat-san.entity';

@Injectable()
export class DatSanService {
  constructor(
    @InjectRepository(DatSan)
    private datSanRepo: Repository<DatSan>,

    @InjectRepository(LichSan)
    private lichSanRepo: Repository<LichSan>,

    @InjectRepository(SanBai)
    private sanBaiRepo: Repository<SanBai>,

    @InjectRepository(ChiTietDatSan)
    private chiTietRepo: Repository<ChiTietDatSan>
  ) {}

  // =========================
  // SINH VIÊN ĐẶT SÂN
  // =========================
  async create(dto: CreateDatSanDto) {
    // kiểm tra lịch đã có người đặt chưa
    const exist = await this.datSanRepo.findOne({
      where: {
        maLichSan: dto.maLichSan,
        trangThai: In([
          "Chờ duyệt",
          "Đã duyệt",
          "Đã thanh toán",
          "Đã check-in",
          "Hoàn thành",
          "No-show",
        ]),
      },
    });

    if (exist) {
      throw new BadRequestException("Lịch sân đã có người đặt");
    }

    // lấy lịch sân
    const lichSan = await this.lichSanRepo.findOne({
      where: { maLichSan: dto.maLichSan },
    });

    if (!lichSan) {
      throw new BadRequestException("Không tìm thấy lịch sân");
    }

    // lấy thông tin sân
    const san = await this.sanBaiRepo.findOne({
      where: { maSan: lichSan.maSan },
    });

    if (!san) {
      throw new BadRequestException("Không tìm thấy sân");
    }

    // tính số giờ
    if (!lichSan.gioBatDau || !lichSan.gioKetThuc) {
      throw new BadRequestException("Lịch sân không hợp lệ");
    }
    
    const start = lichSan.gioBatDau.toString().split(':');
    const end = lichSan.gioKetThuc.toString().split(':');
    
    const startHour = parseInt(start[0]);
    const endHour = parseInt(end[0]);
    
    const soGio = endHour - startHour;
    if (!san.giaThue) {
      throw new BadRequestException("Sân chưa có giá thuê");
    }
    // tính tổng tiền
    const tongTien = soGio * san.giaThue;
    if (!lichSan.gioBatDau || !lichSan.gioKetThuc) {
      throw new BadRequestException("Lịch sân không hợp lệ");
    }
    // tạo đặt sân
    const datSan = this.datSanRepo.create({
      userId: dto.userId,
      maLichSan: dto.maLichSan,
      ngayDat: new Date(),
      tongTien: tongTien,
      trangThai: "Chờ duyệt",
    });

    return this.datSanRepo.save(datSan);
  }

  // =========================
  // ADMIN DUYỆT ĐẶT SÂN
  // =========================
  async approve(id: number, adminId: number) {
    const booking = await this.datSanRepo.findOne({
      where: { maDatSan: id },
    });

    if (!booking) {
      throw new BadRequestException("Không tìm thấy đặt sân");
    }

    booking.trangThai = "Đã duyệt";
    booking.nguoiDuyet = adminId;

    await this.datSanRepo.save(booking);

    // insert chi tiết đặt sân
    const chiTiet = this.chiTietRepo.create({
      maDatSan: booking.maDatSan,
      giaTheoGio: booking.tongTien
    });
  
    await this.chiTietRepo.save(chiTiet);

    return booking;
  }

  // =========================
  // ADMIN TỪ CHỐI
  // =========================
  async reject(id: number, adminId: number) {
    const booking = await this.datSanRepo.findOne({
      where: { maDatSan: id },
    });

    if (!booking) {
      throw new BadRequestException("Không tìm thấy đặt sân");
    }

    booking.trangThai = "Bị từ chối";
    booking.nguoiDuyet = adminId;

    return this.datSanRepo.save(booking);
  }

  // =========================
  // LẤY DANH SÁCH ĐẶT SÂN
  // =========================
  async findAll() {
    return this.datSanRepo.find();
  }

  //----US-10: Sinh viên hủy đặt sân 
  async cancel(id: number, sinhVienId: number) {

    const datSan = await this.datSanRepo.findOne({
      where: { maDatSan: id },
    });
  
    if (!datSan) {
      throw new NotFoundException('Không tìm thấy yêu cầu đặt sân');
    }
  
    // kiểm tra đúng sinh viên đặt
    if (datSan.userId !== sinhVienId) {
      throw new BadRequestException('Bạn không có quyền hủy yêu cầu này');
    }
  
    // chỉ cho phép hủy khi chờ duyệt hoặc đã duyệt
    if (
      datSan.trangThai !== 'Chờ duyệt' &&
      datSan.trangThai !== 'Đã duyệt'
    ) {
      throw new BadRequestException(
        'Yêu cầu này không thể hủy ở trạng thái hiện tại',
      );
    }
  
    datSan.trangThai = 'Đã hủy';
  
    return this.datSanRepo.save(datSan);
  }
}
