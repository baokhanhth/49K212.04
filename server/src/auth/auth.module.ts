import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { NguoiDung } from '../nguoi-dung/entities/nguoi-dung.entity';
import { OtpKhoiPhucMatKhau } from './entities/otp-khoi-phuc.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([NguoiDung, OtpKhoiPhucMatKhau]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule { }