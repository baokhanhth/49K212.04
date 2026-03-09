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

      // 2. Lọc theo loại sân nếu có maLoaiSan
      let filteredLich = lichSans;
      if (maLoaiSan) {
        filteredLich = lichSans.filter(
          (lich) => lich.sanBai?.maLoaiSan === Number(maLoaiSan),
        );
      }

      // Trường hợp không tìm thấy lịch nào sau khi lọc
      if (!filteredLich || filteredLich.length === 0) {
        throw new NotFoundException(`Không có lịch sân cho yêu cầu của bạn vào ngày ${dateStr}`);
      }

      // 3. Map kết quả trả về Ma trận trạng thái
      return filteredLich.map((lich) => {
        // 1. Ép kiểu Giờ Bắt Đầu (timeStartStr)
        const timeStartStr = typeof lich.gioBatDau === 'string'
          ? lich.gioBatDau
          : new Date(lich.gioBatDau).toLocaleTimeString('it-IT');

        // 2. Ép kiểu Giờ Kết Thúc (timeEndStr) - ĐÂY LÀ CHỖ QUAN TRỌNG
        const timeEndStr = typeof lich.gioKetThuc === 'string'
          ? lich.gioKetThuc
          : new Date(lich.gioKetThuc).toLocaleTimeString('it-IT');

        // 3. Lấy Hour/Min để so sánh "Hết giờ"
        const [hour, min] = timeStartStr.split(':');
        const slotStartTime = new Date(dateStr);
        slotStartTime.setHours(Number(hour), Number(min), 0, 0);
        let finalStatus = 'Trống';

        // Ưu tiên 1: Sân đang bảo trì (Dữ liệu từ thực thể SanBai)
        if (lich.sanBai?.trangThai === 'Bảo trì') {
          finalStatus = 'Bảo trì';
        }
        // Ưu tiên 2: Khung giờ đã trôi qua so với hiện tại
        else if (slotStartTime < now) {
          finalStatus = 'Quá giờ';
        }
        // Ưu tiên 3: Slot đã được đặt (Dựa trên OneToOne relation datSan)
        else if (lich.datSan) {
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
      // Nếu là lỗi NotFoundException đã quăng ở trên thì giữ nguyên
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Các lỗi crash code khác sẽ log ra terminal để Khanh dễ soi
      console.error('Lỗi logic US-08:', error);
      throw new InternalServerErrorException(`Lỗi hệ thống khi xử lý ma trận: ${error.message}`);
    }
  }
}