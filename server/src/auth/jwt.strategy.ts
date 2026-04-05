import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { TokenBlacklistService } from './token-blacklist.service';
import { UnauthorizedException } from '@nestjs/common';

export interface JwtPayload {
  sub: number;
  username: string;
  maVaiTro: number;
}
//dăng xuất 
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService,
    private readonly tokenBlacklistService: TokenBlacklistService,) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'football_web_secret_key'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = (req.headers['authorization'] ?? '').replace('Bearer ', '');
    if (this.tokenBlacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token đã bị vô hiệu hóa, vui lòng đăng nhập lại');
    }
    if (this.tokenBlacklistService.isUserBlocked(payload.sub)) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }
    return {
      userId: payload.sub,
      username: payload.username,
      maVaiTro: payload.maVaiTro,
    };
  }
}
