import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    ParseIntPipe,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiParam,
    ApiResponse as SwaggerResponse,
  } from '@nestjs/swagger';
  import { VeDienTuService } from './ve-dien-tu.service';
  import { CheckInOutDto } from './dto/check-in-out.dto';
  import {
    successResponse,
    ApiResponse,
  } from '../common/interfaces/api-response.interface';
  import { VeDienTu } from './entities/ve-dien-tu.entity';
  
  @ApiTags('ve-dien-tu')
  @Controller('ve-dien-tu')
  export class VeDienTuController {
    constructor(private readonly veDienTuService: VeDienTuService) {}
  
    @Get(':maVe')
    @ApiOperation({ summary: 'Lấy vé điện tử theo mã vé' })
    @ApiParam({ name: 'maVe', type: String })
    async findOne(
      @Param('maVe') maVe: string  // ← string, không dùng ParseIntPipe
    ): Promise<ApiResponse<VeDienTu>> {
      const data = await this.veDienTuService.findOne(maVe);
      return successResponse(data, 'Lấy thông tin vé thành công');
    }
  
    @Get('dat-san/:maDatSan')
    @ApiOperation({ summary: 'Lấy vé điện tử theo mã đặt sân' })
    @ApiParam({ name: 'maDatSan', type: Number })
    async findByMaDatSan(
      @Param('maDatSan', ParseIntPipe) maDatSan: number
    ): Promise<ApiResponse<VeDienTu>> {
      const data = await this.veDienTuService.findByMaDatSan(maDatSan);
      return successResponse(data, 'Lấy vé điện tử thành công');
    }
  
    @Get('qr/:qrCode')
    @ApiOperation({ summary: 'Tra cứu vé bằng QR Code' })
    @ApiParam({ name: 'qrCode', type: String })
    async findByQrCode(
      @Param('qrCode') qrCode: string
    ): Promise<ApiResponse<VeDienTu>> {
      const data = await this.veDienTuService.findByQrCode(qrCode);
      return successResponse(data, 'Tra cứu vé thành công');
    }
  
    @Patch('check-in')
    @ApiOperation({ summary: 'Check-in bằng QR Code' })
    @SwaggerResponse({ status: 200, description: 'Check-in thành công' })
    async checkIn(@Body() dto: CheckInOutDto): Promise<ApiResponse<VeDienTu>> {
      const data = await this.veDienTuService.checkIn(dto);
      return successResponse(data, 'Check-in thành công');
    }
  
    @Patch('check-out')
    @ApiOperation({ summary: 'Check-out bằng QR Code' })
    @SwaggerResponse({ status: 200, description: 'Check-out thành công' })
    async checkOut(@Body() dto: CheckInOutDto): Promise<ApiResponse<VeDienTu>> {
      const data = await this.veDienTuService.checkOut(dto);
      return successResponse(data, 'Check-out thành công');
    }

    @Get('qr-image/:qrCode')
    @ApiOperation({ summary: 'Lấy ảnh QR Code dạng base64' })
    @ApiParam({ name: 'qrCode', type: String })
    async getQrImage(
    @Param('qrCode') qrCode: string,
    ): Promise<ApiResponse<string>> {
    const data = await this.veDienTuService.getQrImage(qrCode);
    return successResponse(data, 'Lấy ảnh QR thành công');
    }
    @Get('user/:userId')
    @ApiOperation({ summary: 'Lấy danh sách vé của sinh viên (E14.2)' })
    @ApiParam({ name: 'userId', type: Number })
    async findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    ): Promise<ApiResponse<any>> {
    const data = await this.veDienTuService.findByUserId(userId);
    return successResponse(data, data.length === 0 ? 'Bạn chưa có vé nào.' : 'Lấy danh sách vé thành công');
    }

    // E14.5 - Chi tiết vé kèm ảnh QR
    @Get('chi-tiet/:maVe')
    @ApiOperation({ summary: 'Xem chi tiết vé điện tử (E14.5)' })
    @ApiParam({ name: 'maVe', type: String })
    async getChiTietVe(
    @Param('maVe') maVe: string,
    ): Promise<ApiResponse<any>> {
    const data = await this.veDienTuService.getChiTietVe(maVe);
    return successResponse(data, 'Lấy chi tiết vé thành công');
    }
}