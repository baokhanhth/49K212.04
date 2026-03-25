import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { NguoiDung } from '../nguoi-dung/entities/nguoi-dung.entity';
import { OtpKhoiPhucMatKhau } from './entities/otp-khoi-phuc.entity';
import { QuenMatKhauDto } from './dto/quen-mat-khau.dto';
import { DatLaiMatKhauDto } from './dto/dat-lai-mat-khau.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(NguoiDung)
        private readonly nguoiDungRepo: Repository<NguoiDung>,

        @InjectRepository(OtpKhoiPhucMatKhau)
        private readonly otpRepo: Repository<OtpKhoiPhucMatKhau>,

        private readonly configService: ConfigService,
    ) { }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private async sendOtpEmail(email: string, otp: string): Promise<void> {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASS'),
            },
        });

        await transporter.sendMail({
            from: this.configService.get<string>('MAIL_USER'),
            to: email,
            subject: 'Mã OTP khôi phục mật khẩu',
            html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Khôi phục mật khẩu</h2>
          <p>Bạn vừa yêu cầu khôi phục mật khẩu.</p>
          <p>Mã OTP của bạn là:</p>
          <h1 style="color: #2563eb; letter-spacing: 4px;">${otp}</h1>
          <p>Mã này có hiệu lực trong <b>5 phút</b>.</p>
          <p>Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
        </div>
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

    async quenMatKhau(dto: QuenMatKhauDto) {
        const { email } = dto;

        const nguoiDung = await this.timNguoiDungTheoEmail(email);

        if (!nguoiDung) {
            throw new NotFoundException('Email không tồn tại trong hệ thống');
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
        await this.sendOtpEmail(email, otp);

        return {
            email,
            expiresAt,
        };
    }

    async datLaiMatKhau(dto: DatLaiMatKhauDto) {
        const { email, otp, newPassword } = dto;

        const nguoiDung = await this.timNguoiDungTheoEmail(email);

        if (!nguoiDung) {
            throw new NotFoundException('Email không tồn tại trong hệ thống');
        }

        const otpRecord = await this.otpRepo.findOne({
            where: { email, otp },
            order: { createdAt: 'DESC' },
        });

        if (!otpRecord) {
            throw new BadRequestException('OTP không đúng');
        }

        if (otpRecord.isUsed) {
            throw new BadRequestException('OTP đã được sử dụng');
        }

        if (new Date() > new Date(otpRecord.expiresAt)) {
            throw new BadRequestException('OTP đã hết hạn');
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