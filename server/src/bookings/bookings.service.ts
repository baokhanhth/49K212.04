import { Injectable, NotFoundException } from '@nestjs/common';
import { LichSanService } from '../lich-san/lich-san.service';
import { SanBaiService } from '../san-bai/san-bai.service';

@Injectable()
export class BookingsService {
  constructor(
    private readonly lichSanService: LichSanService,
    private readonly sanBaiService: SanBaiService,
  ) {}

  /**
   * US-08: Lấy ma trận lịch trống cho sinh viên
   */
  async getMatrix(maSan: number, dateStr: string) {
    const now = new Date();

    // 1. Kiểm tra sân bãi (Dùng logic của US18)
    const sanBai = await this.sanBaiService.findOne(maSan);

    // 2. Lấy danh sách lịch "sạch" cho sinh viên 
    // Nó chỉ trả về các slot Trống, Không bị khóa, và trong khoảng ngày cho phép
    const lichSans = await this.lichSanService.findAllChoSinhVien({
      maSan,
      tuNgay: dateStr,
      denNgay: dateStr,
    });

    if (!lichSans || lichSans.length === 0) {
      throw new NotFoundException(`Không có lịch trống khả dụng cho ngày ${dateStr}`);
    }

    // 3. Map kết quả trả về Ma trận trạng thái
    return lichSans.map(lich => {
      // Logic xử lý trạng thái "Hết giờ" dựa trên KhungGio (Dữ liệu từ KhungGioService của nhóm)
      const [hour, min] = lich.khungGio.gioBatDau.split(':');
      const slotStartTime = new Date(dateStr);
      slotStartTime.setHours(+hour, +min, 0, 0);

      let finalStatus = 'Trống'; 

      // Nếu sân đang bảo trì (Dữ liệu từ SanBaiService)
      if (sanBai.trangThai === 'Bảo trì') {
        finalStatus = 'Bảo trì';
      } 
      // Nếu slot này đã trôi qua so với thời gian thực tế
      else if (slotStartTime < now) {
        finalStatus = 'Hết giờ';
      }

      return {
        maLich: lich.maLichSan,
        khungGio: `${lich.khungGio.gioBatDau} - ${lich.khungGio.gioKetThuc}`,
        trangThai: finalStatus,
        giaThue: sanBai.giaThue,
        canBook: finalStatus === 'Trống'
      };
    });
  }
}