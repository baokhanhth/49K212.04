import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { CheckInService } from './check-in.service';
import {
  successResponse,
  ApiResponse,
} from '../common/interfaces/api-response.interface';

@ApiTags('check-in')
@Controller('check-in')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  // ───────────── E15.2 – Quét QR → Hiển thị thông tin vé ─────────────

  @Get('ve/:maDatSan')
  @ApiOperation({
    summary: 'Tra cứu thông tin vé theo mã đặt sân (US-15)',
    description:
      'Quét QR hoặc nhập mã đặt sân để xem thông tin vé. Hiển thị: mã đặt sân, người đặt, sân, thời gian, trạng thái.',
  })
  @ApiParam({ name: 'maDatSan', description: 'Mã đặt sân (từ QR code)', type: Number })
  @SwaggerResponse({ status: 200, description: 'Thông tin vé' })
  @SwaggerResponse({ status: 404, description: 'QR không hợp lệ' })
  async getThongTinVe(
    @Param('maDatSan', ParseIntPipe) maDatSan: number,
  ): Promise<ApiResponse<any>> {
    const data = await this.checkInService.getThongTinVe(maDatSan);
    return successResponse(data, 'Lấy thông tin vé thành công');
  }

  // ───────────── E15.3, E15.4, E15.5, E15.7 – Thực hiện check-in ─────────────

  @Post(':maDatSan')
  @ApiOperation({
    summary: 'Check-in vé điện tử (US-15)',
    description:
      'Thực hiện check-in theo mã đặt sân. Chỉ cho phép khi trạng thái "Đã duyệt". ' +
      'Trễ ≤ 20 phút: check-in thành công (+10 điểm). Trễ > 20 phút: No-show (-10 điểm). ' +
      'Không cho check-in lại nếu đã check-in.',
  })
  @ApiParam({ name: 'maDatSan', description: 'Mã đặt sân (từ QR code)', type: Number })
  @SwaggerResponse({ status: 200, description: 'Check-in thành công hoặc No-show' })
  @SwaggerResponse({ status: 400, description: 'Trạng thái không hợp lệ / Trùng check-in' })
  @SwaggerResponse({ status: 404, description: 'QR không hợp lệ' })
  async checkIn(
    @Param('maDatSan', ParseIntPipe) maDatSan: number,
  ): Promise<ApiResponse<any>> {
    const data = await this.checkInService.checkIn(maDatSan);
    return successResponse(data, data.message);
  }
}
