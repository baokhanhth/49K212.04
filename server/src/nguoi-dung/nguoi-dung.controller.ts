import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { NguoiDungService } from './nguoi-dung.service';
import { KhoaQuyenDto } from './dto/khoa-quyen.dto';
import { successResponse, ApiResponse } from '../common/interfaces/api-response.interface';
import { NguoiDung } from './entities/nguoi-dung.entity';
import { DangKyTaiKhoanDto } from './dto/dang-ky-tai-khoan.dto';
import { DangKyResponseDto } from './dto/dang-ky-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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


// dang ky tai khoan
@Post('dang-ky')
  @ApiOperation({
    summary:
      'Sinh viên đăng ký tài khoản, tên đăng nhập phải là email trường @due.edu.vn',
  })
  @SwaggerResponse({ status: 201, description: 'Đăng ký thành công' })
  @SwaggerResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc đã tồn tại',
  })
  async dangKyTaiKhoan(
    @Body() dto: DangKyTaiKhoanDto,
  ): Promise<ApiResponse<DangKyResponseDto>> {
    const data = await this.nguoiDungService.dangKyTaiKhoan(dto);
    return successResponse(data, 'Đăng ký tài khoản thành công');
  }
    //anh dai dien 
    
    @Post(':id/upload-anh-dai-dien')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = extname(file.originalname);
        callback(null, `avatar-${uniqueSuffix}${extension}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return callback(
          new BadRequestException('Chỉ chấp nhận file ảnh jpg, jpeg, png, webp'),
          false,
        );
      }
      callback(null, true);
    },
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
    },
  }),
)
@ApiOperation({ summary: 'Upload ảnh đại diện cho người dùng' })
@ApiParam({ name: 'id', type: Number })
async uploadAnhDaiDien(
  @Param('id', ParseIntPipe) id: number,
  @UploadedFile() file: Express.Multer.File,
) {
  if (!file) {
    throw new BadRequestException('Vui lòng chọn file ảnh');
  }

  const data = await this.nguoiDungService.capNhatAnhDaiDien(
    id,
    `/uploads/avatars/${file.filename}`,
  );

  return successResponse(data, 'Upload ảnh đại diện thành công');
}
}