import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenBlacklistService } from './token-blacklist.service';

import { DangNhapDto } from './dto/dang-nhap.dto';
import { DangNhapResponseDto } from './dto/dang-nhap-response.dto';
import { QuenMatKhauDto } from './dto/quen-mat-khau.dto';
import { DatLaiMatKhauDto } from './dto/dat-lai-mat-khau.dto';

import {
  ApiResponse,
  successResponse,
} from '../common/interfaces/api-response.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) { }

  @Post('dang-nhap')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập hệ thống (US-02)' })
  @SwaggerResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về JWT token và thông tin user',
  })
  @SwaggerResponse({
    status: 401,
    description: 'Sai tài khoản hoặc mật khẩu',
  })
  @SwaggerResponse({
    status: 403,
    description: 'Tài khoản bị khóa',
  })
  async dangNhap(
    @Body() dto: DangNhapDto,
  ): Promise<ApiResponse<DangNhapResponseDto>> {
    const data = await this.authService.dangNhap(dto);
    return successResponse(data, 'Đăng nhập thành công');
  }

  @Post('dang-xuat')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất hệ thống' })
  async dangXuat(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    this.tokenBlacklistService.addToBlacklist(token);
    return { message: 'Đăng xuất thành công' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi OTP quên mật khẩu' })
  async quenMatKhau(@Body() dto: QuenMatKhauDto) {
    const data = await this.authService.quenMatKhau(dto);
    return successResponse(data, 'OTP đã được gửi về email');
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đặt lại mật khẩu' })
  async datLaiMatKhau(@Body() dto: DatLaiMatKhauDto) {
    const data = await this.authService.datLaiMatKhau(dto);
    return successResponse(data, 'Đặt lại mật khẩu thành công');
  }
}