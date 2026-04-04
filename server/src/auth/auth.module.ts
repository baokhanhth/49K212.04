import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { NguoiDung } from '../nguoi-dung/entities/nguoi-dung.entity';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NguoiDung]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'football_web_secret_key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenBlacklistService],
  exports: [AuthService, JwtStrategy, PassportModule, PassportModule, TokenBlacklistService], 
})
export class AuthModule {}
=======
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
>>>>>>> feat/US-04-BE
