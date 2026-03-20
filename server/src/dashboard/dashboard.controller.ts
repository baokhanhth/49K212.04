import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  successResponse,
  ApiResponse,
} from '../common/interfaces/api-response.interface';
import { QueryLichTongHopDto } from './dto/query-lich-tong-hop.dto';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // ───────────── E19.2 – Thống kê tổng quan ─────────────

  @Get('thong-ke')
  @ApiOperation({
    summary: 'Thống kê tổng quan cho Dashboard (US-19)',
    description:
      'Trả về: Tổng số sân, Đặt sân hôm nay, Chờ duyệt, Doanh thu tháng.',
  })
  @SwaggerResponse({ status: 200, description: 'Thống kê tổng quan' })
  async getThongKe(): Promise<ApiResponse<any>> {
    const data = await this.dashboardService.getThongKeTongQuan();
    return successResponse(data, 'Lấy thống kê tổng quan thành công');
  }

  // ───────────── E19.8 – Hiệu suất sử dụng sân ─────────────

  @Get('hieu-suat')
  @ApiOperation({
    summary: 'Thống kê hiệu suất sử dụng sân (US-19)',
    description:
      'Trả về số lượng booking và doanh thu cho từng sân.',
  })
  @SwaggerResponse({ status: 200, description: 'Thống kê hiệu suất' })
  async getHieuSuat(): Promise<ApiResponse<any>> {
    const data = await this.dashboardService.getHieuSuat();
    return successResponse(data, 'Lấy thống kê hiệu suất thành công');
  }

  // ───────────── E19.9 – Lịch tổng hợp ─────────────

  @Get('lich-tong-hop')
  @ApiOperation({
    summary: 'Lịch tổng hợp sử dụng sân (US-19)',
    description:
      'Xem tổng quan lịch sử dụng sân theo ngày/tuần/tháng. ' +
      'Tình trạng: Trống, Chờ duyệt, Đã được đặt, Đang sử dụng, Đã sử dụng xong, Không sử dụng, Bảo trì.',
  })
  @SwaggerResponse({ status: 200, description: 'Lịch tổng hợp' })
  async getLichTongHop(
    @Query() query: QueryLichTongHopDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.dashboardService.getLichTongHop(query);
    return successResponse(data, 'Lấy lịch tổng hợp thành công');
  }
}
