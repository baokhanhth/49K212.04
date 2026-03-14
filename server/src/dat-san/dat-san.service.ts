import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { LichSanService } from '../lich-san/lich-san.service';
import { SanBaiService } from '../san-bai/san-bai.service';

@Injectable()
export class DatSanService {
  constructor(
    private readonly lichSanService: LichSanService,
    private readonly sanBaiService: SanBaiService,
  ) {}

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
        throw new NotFoundException(`Không có lịch sân cho yêu cầu của bạn vào ngày ${dateStr}`);
      }
      return filteredLich.map((lich) => {
        const timeStartStr = typeof lich.gioBatDau === 'string'
          ? lich.gioBatDau
          : new Date(lich.gioBatDau).toLocaleTimeString('it-IT');
        const timeEndStr = typeof lich.gioKetThuc === 'string'
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
      if (error instanceof NotFoundException) throw error;
      console.error('Lỗi logic US-08:', error);
      throw new InternalServerErrorException(`Lỗi hệ thống khi xử lý ma trận: ${error.message}`);
    }
  }

  async getLichSu(maNguoiDung: number) {
    try {
      const lichSu = await this.lichSanService.findAll({});
      const result = lichSu
        .filter(lich => lich.datSan?.maNguoiDung === maNguoiDung)
        .map(lich => {
          const timeStartStr = typeof lich.gioBatDau === 'string'
            ? lich.gioBatDau
            : new Date(lich.gioBatDau).toLocaleTimeString('it-IT');
          const timeEndStr = typeof lich.gioKetThuc === 'string'
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
        throw new NotFoundException(`Không tìm thấy lịch sử đặt sân cho người dùng ${maNguoiDung}`);
      }
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('Lỗi logic US-11:', error);
      throw new InternalServerErrorException(`Lỗi hệ thống: ${error.message}`);
    }
  }
}