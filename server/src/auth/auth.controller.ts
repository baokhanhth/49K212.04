import { Controller, Post, Body, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { DangNhapDto } from './dto/dang-nhap.dto';
import { successResponse, ApiResponse } from '../common/interfaces/api-response.interface';
import { DangNhapResponseDto } from './dto/dang-nhap-response.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenBlacklistService } from './token-blacklist.service';
import { JwtService } from '@nestjs/jwt';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
              private readonly tokenBlacklistService: TokenBlacklistService,
              private readonly jwtService: JwtService,
    ) {}

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

  // dang xuat 
  @Post('dang-xuat')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất hệ thống' })
  async dangXuat(@Headers('authorization') authHeader: string) {
    // Tách token ra khỏi chuỗi "Bearer <token>"
    const token = authHeader?.replace('Bearer ', '');

    // Trường hợp không có token (dù đã qua guard, phòng thủ thêm)
    if (!token) {
      return { message: 'Đăng xuất thành công' };
    }

    // Decode token để lấy trường exp (thời điểm hết hạn, tính bằng giây)
    // Không cần verify vì guard phía trên đã verify rồi
    const payload = this.jwtService.decode(token) as { exp?: number };

    // Tính TTL còn lại của token (giây) để blacklist đúng thời hạn
    // Nếu không có exp thì mặc định 24h
    // Mục đích: blacklist chỉ cần tồn tại đến khi token tự hết hạn,
    // sau đó passport-jwt sẽ tự chặn, không cần giữ trong blacklist nữa
    const ttl = payload?.exp
      ? payload.exp - Math.floor(Date.now() / 1000)
      : 86400;

    // Chỉ blacklist nếu token còn thời gian hiệu lực
    // (token đã hết hạn thì không cần blacklist vì passport-jwt tự chặn)
    if (ttl > 0) {
      this.tokenBlacklistService.addToBlacklist(token, ttl);
    }

    return { message: 'Đăng xuất thành công' };
  }
}
