import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { DatSanService } from './dat-san.service';
import { CreateDatSanDto } from './dto/create-dat-san.dto';
import { CreateDatSanThuCongDto } from './dto/create-dat-san-thu-cong.dto';
import { QueryDatSanDto } from './dto/query-dat-san.dto';
import { DuyetDatSanDto } from './dto/duyet-dat-san.dto';
import {
  successResponse,
  ApiResponse,
} from '../common/interfaces/api-response.interface';
import { DatSan } from '../lich-san/entities/dat-san.entity';

@ApiTags('dat-san')
@Controller('dat-san')
export class DatSanController {
  constructor(private readonly datSanService: DatSanService) {}

  // ───────────── Danh sách yêu cầu đặt sân (AC1) ─────────────

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách yêu cầu đặt sân (US-12)' })
  @SwaggerResponse({ status: 200, description: 'Danh sách yêu cầu đặt sân' })
  async findAll(@Query() query: QueryDatSanDto): Promise<ApiResponse<DatSan[]>> {
    const data = await this.datSanService.findAll(query);
    return successResponse(data, 'Lấy danh sách yêu cầu đặt sân thành công');
  }

  // ───────────── Ma trận lịch (US-08) ─────────────

  @Get('matrix')
  @ApiOperation({ summary: 'Lấy ma trận lịch trống cho sinh viên (US-08)' })
  @ApiQuery({
    name: 'ngay',
    description: 'Ngày cần xem (YYYY-MM-DD)',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'maSan',
    description: 'Lọc theo mã sân cụ thể',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'maLoaiSan',
    description: 'Lọc theo loại sân',
    type: Number,
    required: false,
  })
  async getMatrix(
    @Query('ngay') ngay: string,
    @Query('maSan') maSan?: number,
    @Query('maLoaiSan') maLoaiSan?: number,
  ): Promise<ApiResponse<any>> {
    const data = await this.datSanService.getMatrix(ngay, maSan, maLoaiSan);
    return successResponse(data, 'Lấy ma trận lịch trống thành công');
  }

  // ───────────── Lịch sử đặt sân (US-11) ─────────────

  @Get('lich-su')
  @ApiOperation({ summary: 'Xem lịch sử đặt sân của sinh viên (US-11)' })
  @ApiQuery({
    name: 'maNguoiDung',
    description: 'Mã người dùng',
    type: Number,
    required: true,
  })
  async getLichSu(
    @Query('maNguoiDung', ParseIntPipe) maNguoiDung: number,
  ): Promise<ApiResponse<any>> {
    const data = await this.datSanService.getLichSu(maNguoiDung);
    return successResponse(data, 'Lấy lịch sử đặt sân thành công');
  }

  // ───────────── Chi tiết yêu cầu đặt sân ─────────────

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết yêu cầu đặt sân' })
  @ApiParam({ name: 'id', description: 'Mã đặt sân', type: Number })
  @SwaggerResponse({ status: 200, description: 'Chi tiết yêu cầu đặt sân' })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy yêu cầu' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<DatSan>> {
    const data = await this.datSanService.findOne(id);
    return successResponse(data, 'Lấy chi tiết yêu cầu đặt sân thành công');
  }

  // ───────────── Tạo yêu cầu đặt sân ─────────────

  @Post()
  @ApiOperation({ summary: 'Tạo yêu cầu đặt sân mới' })
  @SwaggerResponse({ status: 201, description: 'Tạo yêu cầu thành công' })
  @SwaggerResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async create(@Body() dto: CreateDatSanDto): Promise<ApiResponse<DatSan>> {
    const data = await this.datSanService.create(dto.userId, dto.maLichSan);
    return successResponse(data, 'Tạo yêu cầu đặt sân thành công');
  }

  // ───────────── Tạo lịch đặt sân thủ công (US-13) ─────────────

  @Post('thu-cong')
  @ApiOperation({ summary: 'Admin tạo lịch đặt sân thủ công (US-13)' })
  @SwaggerResponse({
    status: 201,
    description: 'Tạo đặt sân thủ công thành công',
  })
  @SwaggerResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc khung giờ đã được đặt',
  })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy sân' })
  async createThuCong(
    @Body() dto: CreateDatSanThuCongDto,
  ): Promise<ApiResponse<DatSan>> {
    const data = await this.datSanService.createThuCong(dto);
    return successResponse(data, 'Tạo lịch đặt sân thủ công thành công');
  }

  // ───────────── Duyệt / Từ chối yêu cầu (AC2, AC3) ─────────────

  @Patch(':id/duyet')
  @ApiOperation({ summary: 'Duyệt hoặc từ chối yêu cầu đặt sân (US-12)' })
  @ApiParam({ name: 'id', description: 'Mã đặt sân', type: Number })
  @SwaggerResponse({
    status: 200,
    description: 'Cập nhật trạng thái thành công',
  })
  @SwaggerResponse({ status: 400, description: 'Yêu cầu đã được xử lý' })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy yêu cầu' })
  async duyet(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: DuyetDatSanDto,
  ): Promise<ApiResponse<DatSan>> {
    const data = await this.datSanService.duyet(id, dto.trangThai, dto.nguoiDuyet);
    return successResponse(
      data,
      `Yêu cầu đã được ${dto.trangThai === 'Đã duyệt' ? 'duyệt' : 'từ chối'} thành công`,
    );
  }

  // ───────────── Hủy yêu cầu đặt sân ─────────────

  @Delete(':id')
  @ApiOperation({ summary: 'Hủy yêu cầu đặt sân' })
  @ApiParam({ name: 'id', description: 'Mã đặt sân', type: Number })
  @SwaggerResponse({ status: 200, description: 'Hủy yêu cầu thành công' })
  @SwaggerResponse({
    status: 400,
    description: 'Không thể hủy yêu cầu đã duyệt',
  })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy yêu cầu' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    await this.datSanService.remove(id);
    return successResponse(null, 'Hủy yêu cầu đặt sân thành công');
  }
  // ───────────── Xác nhận thu phí (US-16) ─────────────
@Patch(':id/xac-nhan-thu-phi')
@ApiOperation({ summary: 'Xác nhận thu phí khi sinh viên đến nhận sân (US-16)' })
@ApiParam({ name: 'id', description: 'Mã đặt sân', type: Number })
@SwaggerResponse({ status: 200, description: 'Xác nhận thu phí thành công' })
@SwaggerResponse({ status: 400, description: 'Đơn chưa được duyệt' })
@SwaggerResponse({ status: 404, description: 'Không tìm thấy yêu cầu' })
async xacNhanThuPhi(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: DuyetDatSanDto,
): Promise<ApiResponse<DatSan>> {
  const data = await this.datSanService.xacNhanThuPhi(id, dto.nguoiDuyet);
  return successResponse(data, 'Xác nhận thu phí thành công');
}
}