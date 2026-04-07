import { Controller,Get,Patch,Param, Body,ParseIntPipe,Post,
  UseInterceptors,UploadedFile, BadRequestException, UseGuards, Request,} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NguoiDungService } from './nguoi-dung.service';
import { KhoaQuyenDto } from './dto/khoa-quyen.dto';
import { successResponse, ApiResponse } from '../common/interfaces/api-response.interface';
import { NguoiDung } from './entities/nguoi-dung.entity';
import { DangKyTaiKhoanDto } from './dto/dang-ky-tai-khoan.dto';
import { DangKyResponseDto } from './dto/dang-ky-response.dto';
import { CapNhatHoSoDto } from './dto/cap-nhat-ho-so.dto';
import { DoiMatKhauDto } from './dto/doi-mat-khau.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TaoNhanVienDto } from './dto/tao-nhan-vien.dto';
import { TaoNhanVienResponseDto } from './dto/tao-nhan-vien-response.dto';
@ApiTags('nguoi-dung')
@Controller('nguoi-dung')
export class NguoiDungController {
  constructor(private readonly nguoiDungService: NguoiDungService) {}

  @Get('ho-so')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xem hồ sơ cá nhân (US-05, E5.1-E5.3)' })
  @SwaggerResponse({ status: 200, description: 'Lấy hồ sơ thành công' })
  @SwaggerResponse({ status: 401, description: 'Chưa đăng nhập' })
  async layHoSo(@Request() req: any): Promise<ApiResponse<any>> {
    const data = await this.nguoiDungService.layHoSo(req.user.userId);
    return successResponse(data, 'Lấy hồ sơ cá nhân thành công');
  }

  @Patch('ho-so')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật hồ sơ cá nhân (US-05, E5.4-E5.10)' })
  @SwaggerResponse({ status: 200, description: 'Cập nhật thành công' })
  @SwaggerResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async capNhatHoSo(
    @Request() req: any,
    @Body() dto: CapNhatHoSoDto,
  ): Promise<ApiResponse<any>> {
    const data = await this.nguoiDungService.capNhatHoSo(req.user.userId, dto);
    return successResponse(data, 'Cập nhật thành công');
  }

  @Patch('doi-mat-khau')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đổi mật khẩu (US-05, E5.13-E5.21)' })
  @SwaggerResponse({ status: 200, description: 'Đổi mật khẩu thành công' })
  @SwaggerResponse({ status: 400, description: 'Mật khẩu không hợp lệ' })
  async doiMatKhau(
    @Request() req: any,
    @Body() dto: DoiMatKhauDto,
  ): Promise<ApiResponse<null>> {
    await this.nguoiDungService.doiMatKhau(req.user.userId, dto);
    return successResponse(null, 'Đổi mật khẩu thành công');
  }

  @Post('ho-so/upload-anh-dai-dien')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  @ApiOperation({ summary: 'Upload ảnh đại diện cho hồ sơ cá nhân (US-05, E5.4)' })
  async uploadAnhDaiDienHoSo(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file ảnh');
    }
    const data = await this.nguoiDungService.capNhatAnhDaiDien(
      req.user.userId,
      `/uploads/avatars/${file.filename}`,
    );
    return successResponse(data, 'Upload ảnh đại diện thành công');
  }

  @Get('sinh-vien')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách tất cả sinh viên' })
  async findAllSinhVien(): Promise<ApiResponse<NguoiDung[]>> {
    const data = await this.nguoiDungService.findAllSinhVien();
    return successResponse(data, 'Lấy danh sách sinh viên thành công');
  }

  // ===== US-22: Quản lý nhân viên =====
  @Get('nhan-vien')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách nhân viên (US-22, E22.1)' })
  @SwaggerResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async findAllNhanVien(): Promise<ApiResponse<NguoiDung[]>> {
    const data = await this.nguoiDungService.findAllNhanVien();
    return successResponse(data, 'Lấy danh sách nhân viên thành công');
  }

  @Patch(':id/khoa-quyen')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khóa quyền đặt sân của sinh viên' })
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

  @Patch(':id/khoi-phuc-quyen')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khôi phục quyền đặt sân của sinh viên' })
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

  @Patch(':id/diem-uy-tin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật điểm uy tín' })
  @ApiParam({ name: 'id', type: Number })
  async capNhatDiemUyTin(
    @Param('id', ParseIntPipe) id: number,
    @Body('diemMoi', ParseIntPipe) diemMoi: number,
  ): Promise<ApiResponse<NguoiDung>> {
    const data = await this.nguoiDungService.capNhatDiemUyTin(id, diemMoi);
    return successResponse(data, 'Cập nhật điểm uy tín thành công');
  }

  @Post('dang-ky')
  @ApiOperation({ summary: 'Sinh viên đăng ký tài khoản' })
  @SwaggerResponse({ status: 201, description: 'Đăng ký thành công' })
  @SwaggerResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc đã tồn tại' })
  async dangKyTaiKhoan(
    @Body() dto: DangKyTaiKhoanDto,
  ): Promise<ApiResponse<DangKyResponseDto>> {
    const data = await this.nguoiDungService.dangKyTaiKhoan(dto);
    return successResponse(data, 'Đăng ký tài khoản thành công');
  }

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
        fileSize: 2 * 1024 * 1024,
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
  //us21-admin tạo tài khoản nhân viên thủ công 
  // Thêm endpoint - đặt cùng cấp với các @Post khác
  @Post('admin/nhan-vien')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tạo tài khoản nhân viên trực sân (E21)' })
  @SwaggerResponse({ status: 201, description: 'Tạo tài khoản thành công' })
  @SwaggerResponse({ status: 400, description: 'Email hoặc SĐT đã tồn tại' })
  @SwaggerResponse({ status: 401, description: 'Chưa đăng nhập' })
  async taoNhanVien(
    @Body() dto: TaoNhanVienDto,
  ): Promise<ApiResponse<TaoNhanVienResponseDto>> {
    const data = await this.nguoiDungService.taoNhanVien(dto);
    return successResponse(data, 'Tạo tài khoản nhân viên thành công');
  }

  @Patch(':id/khoa-tai-khoan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khóa tài khoản nhân viên (US-22, E22.2)' })
  @ApiParam({ name: 'id', type: Number })
  @SwaggerResponse({ status: 200, description: 'Khóa thành công' })
  @SwaggerResponse({ status: 400, description: 'Tài khoản đã bị khóa hoặc không phải nhân viên' })
  async khoaTaiKhoanNhanVien(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<NguoiDung>> {
    const data = await this.nguoiDungService.khoaTaiKhoanNhanVien(id);
    return successResponse(data, 'Khóa tài khoản nhân viên thành công');
  }

  @Patch(':id/mo-khoa-tai-khoan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mở khóa tài khoản nhân viên (US-22)' })
  @ApiParam({ name: 'id', type: Number })
  @SwaggerResponse({ status: 200, description: 'Mở khóa thành công' })
  @SwaggerResponse({ status: 400, description: 'Tài khoản đang hoạt động hoặc không phải nhân viên' })
  async moKhoaTaiKhoanNhanVien(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<NguoiDung>> {
    const data = await this.nguoiDungService.moKhoaTaiKhoanNhanVien(id);
    return successResponse(data, 'Mở khóa tài khoản nhân viên thành công');
  }
}
