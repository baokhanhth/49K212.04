import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DangNhapDto } from './dto/dang-nhap.dto';
import { DangNhapResponseDto } from './dto/dang-nhap-response.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NguoiDung } from '../nguoi-dung/entities/nguoi-dung.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(NguoiDung)
    private readonly nguoiDungRepo: Repository<NguoiDung>,
    private readonly jwtService: JwtService,
  ) {}

  async dangNhap(dto: DangNhapDto): Promise<DangNhapResponseDto> {
    const { username, matKhau } = dto;
    const input = username.trim().toLowerCase();

    const user = await this.nguoiDungRepo.findOne({
      where: [
        { username: input },
        { msv: input },
        { emailTruong: input },
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    }

    const isPasswordValid = await bcrypt.compare(matKhau, user.matKhau);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu');
    }

    if (!user.trangThai) {
      throw new ForbiddenException(
        'Tài khoản của bạn đang bị khóa. Vui lòng liên hệ với quản lý để mở khóa quyền truy cập.',
      );
    }

    const payload = {
      sub: user.userId,
      username: user.username,
      maVaiTro: user.maVaiTro,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        userId: user.userId,
        username: user.username,
        hoTen: user.hoTen,
        maVaiTro: user.maVaiTro,
        msv: user.msv,
        anhDaiDien: user.anhDaiDien,
      },
    };
  }
}
