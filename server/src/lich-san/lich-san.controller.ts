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
  constructor(private readonly lichSanService: LichSanService) { }

  // ================== ⭐ TEST PROC ==================
  @Post('auto-generate')
  @ApiOperation({ summary: 'Test tạo lịch sân tự động (gọi proc)' })
  async autoGenerate(): Promise<ApiResponse<null>> {
    await this.lichSanService.taoLichTuDong();
    return successResponse(null, 'Đã gọi proc tạo lịch sân');
  }

  // ================== FIND ==================

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lịch sân' })
  async findAll(
    @Query() query: QueryLichSanDto,
  ): Promise<ApiResponse<LichSan[]>> {
    const data = await this.lichSanService.findAll(query);
    return successResponse(data, 'Lấy danh sách lịch sân thành công');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết lịch sân theo mã' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<LichSan>> {
    const data = await this.lichSanService.findOne(id);
    return successResponse(data, 'Lấy lịch sân thành công');
  }

  // ================== CREATE ==================

  @Post()
  async create(
    @Body() dto: CreateLichSanDto,
  ): Promise<ApiResponse<LichSan>> {
    const data = await this.lichSanService.create(dto);
    return successResponse(data, 'Tạo lịch sân thành công');
  }

  // ================== GENERATE ==================

  @Post('generate')
  async generate(
    @Body() dto: GenerateLichSanDto,
  ): Promise<ApiResponse<{ created: number; skipped: number }>> {
    const data = await this.lichSanService.generate(dto);
    return successResponse(
      data,
      `Đã tạo ${data.created}, bỏ qua ${data.skipped}`,
    );
  }

  // ================== TOGGLE ==================

  @Post('toggle')
  async toggleDate(
    @Body() dto: ToggleLichSanDto,
  ): Promise<ApiResponse<{ message: string; affected: number }>> {
    const data = await this.lichSanService.toggleDate(dto);
    return successResponse(data, data.message);
  }

  // ================== DELETE ==================

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    await this.lichSanService.remove(id);
    return successResponse(null, 'Xóa lịch sân thành công');
  }

  @Delete('by-date/:maSan/:ngayApDung')
  async removeByDate(
    @Param('maSan', ParseIntPipe) maSan: number,
    @Param('ngayApDung') ngayApDung: string,
  ): Promise<ApiResponse<{ deleted: number }>> {
    const data = await this.lichSanService.removeByDate(maSan, ngayApDung);
    return successResponse(data, `Đã xóa ${data.deleted} lịch`);
  }
}