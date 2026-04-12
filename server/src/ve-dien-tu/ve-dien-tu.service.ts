import {
    Injectable,
    NotFoundException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { VeDienTu } from './entities/ve-dien-tu.entity';
  import { CheckInOutDto } from './dto/check-in-out.dto';
  import * as QRCode from 'qrcode';
  @Injectable()
  export class VeDienTuService {
    constructor(
      @InjectRepository(VeDienTu)
      private readonly veDienTuRepo: Repository<VeDienTu>,
    ) {}
  
    private generateQrCode(maDatSan: number): string {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 10).toUpperCase();
      return `VE-${maDatSan}-${timestamp}-${random}`;
    }
  
    async create(maDatSan: number): Promise<VeDienTu> {
        const existing = await this.veDienTuRepo.findOne({ where: { maDatSan } });
        if (existing) return existing;
      
        // Sinh MaVe dạng VE000000001
        const count = await this.veDienTuRepo.count();
        const maVe = `VE${String(count + 1).padStart(9, '0')}`;
      
        const ve = this.veDienTuRepo.create({
          maVe,
          maDatSan,
          qrCode: this.generateQrCode(maDatSan),
          thoiGianCheckIn: null,
          thoiGianCheckOut: null,
        });
      
        return this.veDienTuRepo.save(ve);
      }
  
      async findOne(maVe: string): Promise<VeDienTu> {
      const ve = await this.veDienTuRepo.findOne({
        where: { maVe },
        relations: ['datSan', 'datSan.lichSan', 'datSan.lichSan.sanBai', 'datSan.lichSan.sanBai.loaiSan'],
      });
      if (!ve) throw new NotFoundException(`Không tìm thấy vé với mã ${maVe}`);
      return ve;
    }
    // sinh ma QRCode
    async getQrImage(qrCode: string): Promise<string> {
        const ve = await this.findByQrCode(qrCode);
        const qrImage = await QRCode.toDataURL(ve.qrCode);
        return qrImage;
      }
  
    async findByMaDatSan(maDatSan: number): Promise<VeDienTu> {
      const ve = await this.veDienTuRepo.findOne({
        where: { maDatSan },
        relations: ['datSan', 'datSan.lichSan', 'datSan.lichSan.sanBai', 'datSan.lichSan.sanBai.loaiSan'],
      });
      if (!ve) throw new NotFoundException(`Không tìm thấy vé cho đơn đặt sân mã ${maDatSan}`);
      return ve;
    }
  
    async findByQrCode(qrCode: string): Promise<VeDienTu> {
      const ve = await this.veDienTuRepo.findOne({
        where: { qrCode },
        relations: ['datSan', 'datSan.lichSan', 'datSan.lichSan.sanBai', 'datSan.lichSan.sanBai.loaiSan'],
      });
      if (!ve) throw new NotFoundException(`Không tìm thấy vé với QR: ${qrCode}`);
      return ve;
    }
  
    async checkIn(dto: CheckInOutDto): Promise<VeDienTu> {
      const ve = await this.findByQrCode(dto.qrCode);
      if (ve.thoiGianCheckIn) throw new BadRequestException('Vé này đã được check-in trước đó');
      ve.thoiGianCheckIn = new Date();
      return this.veDienTuRepo.save(ve);
    }
  
    async checkOut(dto: CheckInOutDto): Promise<VeDienTu> {
      const ve = await this.findByQrCode(dto.qrCode);
      if (!ve.thoiGianCheckIn) throw new BadRequestException('Vé chưa check-in, không thể check-out');
      if (ve.thoiGianCheckOut) throw new BadRequestException('Vé này đã được check-out trước đó');
      ve.thoiGianCheckOut = new Date();
      return this.veDienTuRepo.save(ve);
    }

    // E14.2 - Lấy danh sách vé theo userId
async findByUserId(userId: number): Promise<any[]> {
    const ves = await this.veDienTuRepo.find({
      relations: [
        'datSan',
        'datSan.lichSan',
        'datSan.lichSan.sanBai',
        'datSan.lichSan.sanBai.loaiSan',
      ],
      where: {
        datSan: { userId },
      },
    });
  
    return ves.map((ve) => this.mapVeToResponse(ve));
  }
  
  // E14.3 - Tính trạng thái vé
  private getTrangThaiVe(ve: VeDienTu): string {
    const trangThaiDatSan = ve.datSan?.trangThai;
  
    if (trangThaiDatSan === 'Đã hủy') return 'No-show';
    if (ve.thoiGianCheckOut) return 'Hoàn thành';
    if (ve.thoiGianCheckIn) return 'Đã Check-in';
    if (trangThaiDatSan === 'Đã duyệt') return 'Chưa check-in';
    return trangThaiDatSan ?? 'Không xác định';
  }
  
  // E14.6/E14.7 - Kiểm tra QR hợp lệ
  private isQrValid(ve: VeDienTu): boolean {
    const trangThai = ve.datSan?.trangThai;
    return trangThai === 'Đã duyệt' && !ve.thoiGianCheckIn;
  }
  
  // Map vé sang response
  private mapVeToResponse(ve: VeDienTu): any {
    const lichSan = ve.datSan?.lichSan;
    const sanBai = lichSan?.sanBai;
  
    const gioBatDau = typeof lichSan?.gioBatDau === 'string'
      ? lichSan.gioBatDau.substring(0, 5)
      : new Date(lichSan?.gioBatDau).toLocaleTimeString('it-IT').substring(0, 5);
  
    const gioKetThuc = typeof lichSan?.gioKetThuc === 'string'
      ? lichSan.gioKetThuc.substring(0, 5)
      : new Date(lichSan?.gioKetThuc).toLocaleTimeString('it-IT').substring(0, 5);
  
    return {
      maVe: ve.maVe,
      maDatSan: ve.maDatSan,
      qrCode: ve.qrCode,
      trangThaiVe: this.getTrangThaiVe(ve),
      qrHopLe: this.isQrValid(ve),
      tenSan: sanBai?.tenSan,
      loaiSan: sanBai?.loaiSan?.tenLoaiSan,
      ngayApDung: lichSan?.ngayApDung,
      khungGio: `${gioBatDau} - ${gioKetThuc}`,
      tongTien: ve.datSan?.tongTien,
      thoiGianCheckIn: ve.thoiGianCheckIn,
      thoiGianCheckOut: ve.thoiGianCheckOut,
    };
  }
  
  // E14.5 - Chi tiết vé
  async getChiTietVe(maVe: string): Promise<any> {
    const ve = await this.findOne(maVe);
    const qrImage = await QRCode.toDataURL(ve.qrCode);
    return {
      ...this.mapVeToResponse(ve),
      qrImage: this.isQrValid(ve) ? qrImage : null,
    };
  }
  }