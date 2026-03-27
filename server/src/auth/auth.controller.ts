import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { DangNhapDto } from './dto/dang-nhap.dto';
import { successResponse, ApiResponse } from '../common/interfaces/api-response.interface';
import { DangNhapResponseDto } from './dto/dang-nhap-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
