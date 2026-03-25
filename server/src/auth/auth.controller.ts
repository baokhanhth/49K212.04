import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { QuenMatKhauDto } from './dto/quen-mat-khau.dto';
import { DatLaiMatKhauDto } from './dto/dat-lai-mat-khau.dto';
import { successResponse } from '../common/interfaces/api-response.interface';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('forgot-password')
    async quenMatKhau(@Body() dto: QuenMatKhauDto) {
        const data = await this.authService.quenMatKhau(dto);
        return successResponse(data, 'OTP đã được gửi về email');
    }

    @Post('reset-password')
    async datLaiMatKhau(@Body() dto: DatLaiMatKhauDto) {
        const data = await this.authService.datLaiMatKhau(dto);
        return successResponse(data, 'Đặt lại mật khẩu thành công');
    }
}