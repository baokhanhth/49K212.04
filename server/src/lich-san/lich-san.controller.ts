import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { LichSanService } from './lich-san.service';
import { CreateLichSanDto } from './dto/create-lich-san.dto';
import { GenerateLichSanDto } from './dto/generate-lich-san.dto';
import { QueryLichSanDto } from './dto/query-lich-san.dto';
import { ToggleLichSanDto } from './dto/toggle-lich-san.dto';
import {
  successResponse,
  ApiResponse,
} from '../common/interfaces/api-response.interface';
import { LichSan } from './entities/lich-san.entity';

@ApiTags('lich-san')
@Controller('lich-san')
export class LichSanController {
  constructor(private readonly lichSanService: LichSanService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lịch sân', description: 'Hỗ trợ lọc theo mã sân, khoảng ngày, giờ bắt đầu/kết thúc, trạng thái (trống/đã đặt)' })
  @SwaggerResponse({ status: 200, description: 'Danh sách lịch sân' })
  async findAll(
    @Query() query: QueryLichSanDto,
  ): Promise<ApiResponse<LichSan[]>> {
    const data = await this.lichSanService.findAll(query);
    return successResponse(data, 'Lấy danh sách lịch sân thành công');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết lịch sân theo mã' })
  @ApiParam({ name: 'id', description: 'Mã lịch sân', type: Number })
  @SwaggerResponse({ status: 200, description: 'Chi tiết lịch sân' })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy lịch sân' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<LichSan>> {
    const data = await this.lichSanService.findOne(id);
    return successResponse(data, 'Lấy lịch sân thành công');
  }

  @Post()
  @ApiOperation({ summary: 'Tạo một lịch sân mới' })
  @SwaggerResponse({ status: 201, description: 'Tạo lịch sân thành công' })
  @SwaggerResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc lịch đã tồn tại' })
  @SwaggerResponse({ status: 404, description: 'Sân không tồn tại' })
  async create(
    @Body() dto: CreateLichSanDto,
  ): Promise<ApiResponse<LichSan>> {
    const data = await this.lichSanService.create(dto);
    return successResponse(data, 'Tạo lịch sân thành công');
  }

  @Post('generate')
  @ApiOperation({
    summary: 'Tạo hàng loạt lịch sân',
    description: 'Tạo lịch sân cho khoảng ngày + các khung giờ được chọn. Tối đa 90 ngày. Bỏ qua lịch đã tồn tại.',
  })
  @SwaggerResponse({ status: 201, description: 'Tạo hàng loạt thành công' })
  @SwaggerResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @SwaggerResponse({ status: 404, description: 'Sân không tồn tại' })
  async generate(
    @Body() dto: GenerateLichSanDto,
  ): Promise<ApiResponse<{ created: number; skipped: number }>> {
    const data = await this.lichSanService.generate(dto);
    return successResponse(
      data,
      `Đã tạo ${data.created} lịch sân, bỏ qua ${data.skipped} lịch đã tồn tại`,
    );
  }

  @Post('toggle')
  @ApiOperation({
    summary: 'Đóng/mở lịch sân thủ công',
    description: 'Mở: tạo lịch cho khung giờ chưa có. Đóng: xóa lịch chưa đặt. Lịch đã đặt sẽ không bị ảnh hưởng.',
  })
  @SwaggerResponse({ status: 200, description: 'Đóng/mở lịch thành công' })
  @SwaggerResponse({ status: 404, description: 'Sân không tồn tại' })
  async toggleDate(
    @Body() dto: ToggleLichSanDto,
  ): Promise<ApiResponse<{ message: string; affected: number }>> {
    const data = await this.lichSanService.toggleDate(dto);
    return successResponse(data, data.message);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa lịch sân', description: 'Chỉ xóa được lịch chưa có đặt sân' })
  @ApiParam({ name: 'id', description: 'Mã lịch sân', type: Number })
  @SwaggerResponse({ status: 200, description: 'Xóa lịch sân thành công' })
  @SwaggerResponse({ status: 400, description: 'Không thể xóa lịch đã có đặt sân' })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy lịch sân' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    await this.lichSanService.remove(id);
    return successResponse(null, 'Xóa lịch sân thành công');
  }

  @Delete('by-date/:maSan/:ngayApDung')
  @ApiOperation({ summary: 'Xóa tất cả lịch sân trống theo sân + ngày' })
  @ApiParam({ name: 'maSan', description: 'Mã sân', type: Number })
  @ApiParam({ name: 'ngayApDung', description: 'Ngày áp dụng (YYYY-MM-DD)', type: String })
  @SwaggerResponse({ status: 200, description: 'Xóa lịch sân trống thành công' })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy lịch sân trống' })
  async removeByDate(
    @Param('maSan', ParseIntPipe) maSan: number,
    @Param('ngayApDung') ngayApDung: string,
  ): Promise<ApiResponse<{ deleted: number }>> {
    const data = await this.lichSanService.removeByDate(maSan, ngayApDung);
    return successResponse(data, `Đã xóa ${data.deleted} lịch sân`);
  }
}
