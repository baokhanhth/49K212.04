import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';

import { DangNhapDto } from './dto/dang-nhap.dto';
import { DangNhapResponseDto } from './dto/dang-nhap-response.dto';
import { QuenMatKhauDto } from './dto/quen-mat-khau.dto';
import { DatLaiMatKhauDto } from './dto/dat-lai-mat-khau.dto';

import { NguoiDung } from '../nguoi-dung/entities/nguoi-dung.entity';
import { OtpKhoiPhucMatKhau } from './entities/otp-khoi-phuc.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(NguoiDung)
    private readonly nguoiDungRepo: Repository<NguoiDung>,

    @InjectRepository(OtpKhoiPhucMatKhau)
    private readonly otpRepo: Repository<OtpKhoiPhucMatKhau>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  // ================= LOGIN =================
  async dangNhap(dto: DangNhapDto): Promise<DangNhapResponseDto> {
    const { username, matKhau } = dto;
    const input = username.trim().toLowerCase();

    const whereConditions: any[] = [
      { username: input },
      { emailTruong: input },
    ];
    // Only search by MSV if input looks like a 12-digit student ID
    if (/^\d{12}$/.test(input)) {
      whereConditions.push({ msv: input });
    }

    const user = await this.nguoiDungRepo.findOne({
      where: whereConditions,
    });

    if (!user) {
      throw new UnauthorizedException("Sai tài khoản hoặc mật khẩu");
    }

    const isPasswordValid = await bcrypt.compare(matKhau, user.matKhau);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Sai tài khoản hoặc mật khẩu");
    }

    if (!user.trangThai) {
      throw new ForbiddenException(
        "Tài khoản của bạn đang bị khóa. Vui lòng liên hệ với quản lý để mở khóa quyền truy cập."
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

  // ================= OTP =================
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendOtpEmail(email: string, otp: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
      requireTLS: true,
      connectionTimeout: 10000,
      socketTimeout: 10000,
    } as any);

    await transporter.sendMail({
      from: this.configService.get<string>('MAIL_USER'),
      to: email,
      subject: 'Mã OTP khôi phục mật khẩu',
      html: `
        <h2>Khôi phục mật khẩu</h2>
        <p>Mã OTP của bạn là:</p>
        <h1>${otp}</h1>
        <p>Hiệu lực 5 phút</p>
      `,
    });
  }

  private async timNguoiDungTheoEmail(email: string): Promise<NguoiDung | null> {
    return this.nguoiDungRepo
      .createQueryBuilder('nd')
      .where(
        new Brackets((qb) => {
          qb.where('nd.emailTruong = :email', { email }).orWhere(
            'nd.emailCaNhan = :email',
            { email },
          );
        }),
      )
      .getOne();
  }

  // ================= FORGOT PASSWORD =================
  async quenMatKhau(dto: QuenMatKhauDto) {
    const { email } = dto;

    const nguoiDung = await this.timNguoiDungTheoEmail(email);

    if (!nguoiDung) {
      throw new NotFoundException('Email không tồn tại');
    }

    await this.otpRepo.delete({ email });

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const otpRecord = this.otpRepo.create({
      email,
      otp,
      expiresAt,
      isUsed: false,
    });

    await this.otpRepo.save(otpRecord);

    try {
      await this.sendOtpEmail(email, otp);
    } catch (error) {
      await this.otpRepo.delete({ email });
      throw new BadRequestException('Không thể gửi email OTP. Vui lòng thử lại sau.');
    }

    return { email, expiresAt };
  }

  // ================= RESET PASSWORD =================
  async datLaiMatKhau(dto: DatLaiMatKhauDto) {
    const { email, otp, newPassword } = dto;

    const nguoiDung = await this.timNguoiDungTheoEmail(email);

    if (!nguoiDung) {
      throw new NotFoundException('Email không tồn tại');
    }

    const otpRecord = await this.otpRepo.findOne({
      where: { email, otp },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord) {
      throw new BadRequestException('OTP không đúng');
    }

    if (otpRecord.isUsed) {
      throw new BadRequestException('OTP đã dùng');
    }

    if (new Date() > new Date(otpRecord.expiresAt)) {
      throw new BadRequestException('OTP hết hạn');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    nguoiDung.matKhau = hashedPassword;
    await this.nguoiDungRepo.save(nguoiDung);

    otpRecord.isUsed = true;
    await this.otpRepo.save(otpRecord);

    return {
      userId: nguoiDung.userId,
      email,
    };
  }
}