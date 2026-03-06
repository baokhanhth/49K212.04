import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { KhungGioService } from './khung-gio.service';
import { CreateKhungGioDto } from './dto/create-khung-gio.dto';
import { UpdateKhungGioDto } from './dto/update-khung-gio.dto';
import {
  successResponse,
  ApiResponse,
} from '../common/interfaces/api-response.interface';
import { KhungGio } from './entities/khung-gio.entity';

@ApiTags('khung-gio')
@Controller('khung-gio')
export class KhungGioController {
  constructor(private readonly khungGioService: KhungGioService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khung giờ' })
  @SwaggerResponse({ status: 200, description: 'Danh sách khung giờ' })
  async findAll(): Promise<ApiResponse<KhungGio[]>> {
    const data = await this.khungGioService.findAll();
    return successResponse(data, 'Lấy danh sách khung giờ thành công');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết khung giờ' })
  @ApiParam({ name: 'id', description: 'Mã khung giờ', type: Number })
  @SwaggerResponse({ status: 200, description: 'Chi tiết khung giờ' })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy khung giờ' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<KhungGio>> {
    const data = await this.khungGioService.findOne(id);
    return successResponse(data, 'Lấy khung giờ thành công');
  }

  @Post()
  @ApiOperation({ summary: 'Tạo khung giờ mới' })
  @SwaggerResponse({ status: 201, description: 'Tạo khung giờ thành công' })
  @SwaggerResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc khung giờ đã tồn tại' })
  async create(
    @Body() dto: CreateKhungGioDto,
  ): Promise<ApiResponse<KhungGio>> {
    const data = await this.khungGioService.create(dto);
    return successResponse(data, 'Tạo khung giờ thành công');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật khung giờ' })
  @ApiParam({ name: 'id', description: 'Mã khung giờ', type: Number })
  @SwaggerResponse({ status: 200, description: 'Cập nhật khung giờ thành công' })
  @SwaggerResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy khung giờ' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateKhungGioDto,
  ): Promise<ApiResponse<KhungGio>> {
    const data = await this.khungGioService.update(id, dto);
    return successResponse(data, 'Cập nhật khung giờ thành công');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khung giờ' })
  @ApiParam({ name: 'id', description: 'Mã khung giờ', type: Number })
  @SwaggerResponse({ status: 200, description: 'Xóa khung giờ thành công' })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy khung giờ' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    await this.khungGioService.remove(id);
    return successResponse(null, 'Xóa khung giờ thành công');
  }
}
