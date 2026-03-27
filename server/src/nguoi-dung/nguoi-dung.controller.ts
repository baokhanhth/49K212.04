import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Post, Req, UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { NguoiDungService } from './nguoi-dung.service';
import { KhoaQuyenDto } from './dto/khoa-quyen.dto';
import { successResponse, ApiResponse } from '../common/interfaces/api-response.interface';
import { NguoiDung } from './entities/nguoi-dung.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('nguoi-dung')
@Controller('nguoi-dung')
export class NguoiDungController {
  constructor(private readonly nguoiDungService: NguoiDungService) {}

  // E17.2 - Danh sách sinh viên
  @Get('sinh-vien')
  @ApiOperation({ summary: 'Lấy danh sách tất cả sinh viên (E17.2)' })
  async findAllSinhVien(): Promise<ApiResponse<NguoiDung[]>> {
    const data = await this.nguoiDungService.findAllSinhVien();
    return successResponse(data, 'Lấy danh sách sinh viên thành công');
  }

  // E17.5 - Khóa quyền đặt sân
  @Patch(':id/khoa-quyen')
  @ApiOperation({ summary: 'Khóa quyền đặt sân của sinh viên (E17.5)' })
  @ApiParam({ name: 'id', type: Number })
  @SwaggerResponse({ status: 200, description: 'Khóa thành công' })
  @SwaggerResponse({ status: 400, description: 'Đã bị khóa rồi' })
  async khoaQuyen(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: KhoaQuyenDto,
  ): Promise<ApiResponse<NguoiDung>> {
    const data = await this.nguoiDungService.khoaQuyen(id, dto);
    return successResponse(data, 'Khóa quyền đặt sân thành công');
  }

  // E17.6 - Khôi phục quyền đặt sân
  @Patch(':id/khoi-phuc-quyen')
  @ApiOperation({ summary: 'Khôi phục quyền đặt sân của sinh viên (E17.6)' })
  @ApiParam({ name: 'id', type: Number })
  @SwaggerResponse({ status: 200, description: 'Khôi phục thành công' })
  @SwaggerResponse({ status: 400, description: 'Đang hoạt động rồi' })
  async khoiPhucQuyen(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: KhoaQuyenDto,
  ): Promise<ApiResponse<NguoiDung>> {
    const data = await this.nguoiDungService.khoiPhucQuyen(id, dto);
    return successResponse(data, 'Khôi phục quyền đặt sân thành công');
  }

  // E17.7/E17.9 - Cập nhật điểm uy tín
  @Patch(':id/diem-uy-tin')
  @ApiOperation({ summary: 'Cập nhật điểm uy tín (E17.7, E17.9)' })
  @ApiParam({ name: 'id', type: Number })
  async capNhatDiemUyTin(
    @Param('id', ParseIntPipe) id: number,
    @Body('diemMoi', ParseIntPipe) diemMoi: number,
  ): Promise<ApiResponse<NguoiDung>> {
    const data = await this.nguoiDungService.capNhatDiemUyTin(id, diemMoi);
    return successResponse(data, 'Cập nhật điểm uy tín thành công');
  }
  // đăng xuát
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất' })
  logout(): ApiResponse<null> {
    return successResponse(null, 'Đăng xuất thành công');
  }

  // phia client
  // async function logout() {
  //   await fetch('/nguoi-dung/logout', {
  //     method: 'POST',
  //     headers: {
  //       Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  //     },
  //   });
  
  //   // Bước quan trọng nhất — xóa token khỏi client
  //   localStorage.removeItem('accessToken');
  //   localStorage.removeItem('refreshToken');
  
  //   // Chuyển về trang login
  //   window.location.href = '/login';
  // }
  }
