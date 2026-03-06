import { Controller, Get, Put, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { CauHinhService, ThongTinDatSan } from './cau-hinh.service';
import { UpdateSoNgayDatTruocDto } from './dto/update-so-ngay-dat-truoc.dto';
import {
  successResponse,
  ApiResponse,
} from '../common/interfaces/api-response.interface';
import { CauHinhHeThong } from './entities/cau-hinh.entity';

@ApiTags('cau-hinh')
@Controller('cau-hinh')
export class CauHinhController {
  constructor(private readonly cauHinhService: CauHinhService) {}

  /**
   * GET /api/cau-hinh
   * Lấy toàn bộ cấu hình hệ thống
   */
  @Get()
  @ApiOperation({ summary: 'Lấy toàn bộ cấu hình hệ thống' })
  @SwaggerResponse({ status: 200, description: 'Danh sách cấu hình' })
  async findAll(): Promise<ApiResponse<CauHinhHeThong[]>> {
    const data = await this.cauHinhService.findAll();
    return successResponse(data, 'Lấy danh sách cấu hình thành công');
  }

  /**
   * GET /api/cau-hinh/dat-san
   * Lấy cấu hình đặt sân (soNgayDatTruoc, ngayBatDau, ngayKetThuc)
   * - Frontend dùng API này để biết khoảng ngày cho phép đặt sân
   */
  @Get('dat-san')
  @ApiOperation({
    summary: 'Lấy cấu hình đặt sân',
    description:
      'Trả về số ngày đặt trước và khoảng ngày cho phép đặt sân (ngayBatDau..ngayKetThuc)',
  })
  @SwaggerResponse({ status: 200, description: 'Thông tin cấu hình đặt sân' })
  async getThongTinDatSan(): Promise<ApiResponse<ThongTinDatSan>> {
    const data = await this.cauHinhService.getThongTinDatSan();
    return successResponse(data, 'Lấy cấu hình đặt sân thành công');
  }

  /**
   * PUT /api/cau-hinh/dat-san
   * Admin cập nhật số ngày đặt trước (max_day)
   */
  @Put('dat-san')
  @ApiOperation({
    summary: 'Cập nhật số ngày đặt trước',
    description:
      'Admin nhập số ngày tối đa cho phép đặt trước sân (1-90). ' +
      'Hệ thống sẽ tự động mở lịch cho sinh viên đặt sân trong khoảng [hôm nay, hôm nay + soNgayDatTruoc].',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Cập nhật thành công, trả về thông tin cấu hình mới',
  })
  @SwaggerResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async updateSoNgayDatTruoc(
    @Body() dto: UpdateSoNgayDatTruocDto,
  ): Promise<ApiResponse<ThongTinDatSan>> {
    const data = await this.cauHinhService.updateSoNgayDatTruoc(dto);
    return successResponse(
      data,
      `Đã cập nhật số ngày đặt trước thành ${dto.soNgayDatTruoc} ngày. ` +
        `Sinh viên được phép đặt sân từ ${data.ngayBatDau} đến ${data.ngayKetThuc}`,
    );
  }
}
