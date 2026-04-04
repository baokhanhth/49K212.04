import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NguoiDung } from '../nguoi-dung/entities/nguoi-dung.entity';
import { OtpKhoiPhucMatKhau } from './entities/otp-khoi-phuc.entity';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let nguoiDungRepo: Record<string, jest.Mock>;
  let otpRepo: Record<string, jest.Mock>;

  const hashedPassword = bcrypt.hashSync('Password@123', 10);

  const mockUser: Partial<NguoiDung> = {
    userId: 1,
    username: 'testuser',
    matKhau: hashedPassword,
    hoTen: 'Nguyen Van A',
    maVaiTro: 2,
    msv: '231121521238',
    emailTruong: 'testuser@due.edu.vn',
    anhDaiDien: null,
    trangThai: true,
  };

  beforeEach(async () => {
    nguoiDungRepo = {
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      save: jest.fn(),
    };

    otpRepo = {
      findOne: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(NguoiDung), useValue: nguoiDungRepo },
        { provide: getRepositoryToken(OtpKhoiPhucMatKhau), useValue: otpRepo },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mocked-jwt-token') },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('dangNhap', () => {
    it('should return accessToken and user info on valid credentials', async () => {
      nguoiDungRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.dangNhap({
        username: 'testuser',
        matKhau: 'Password@123',
      });

      expect(result.accessToken).toBe('mocked-jwt-token');
      expect(result.user.userId).toBe(1);
      expect(result.user.username).toBe('testuser');
      expect(result.user.hoTen).toBe('Nguyen Van A');
      expect(result.user.maVaiTro).toBe(2);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        username: 'testuser',
        maVaiTro: 2,
      });
    });

    it('should allow login with email (case-insensitive)', async () => {
      nguoiDungRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.dangNhap({
        username: 'TESTUSER@due.edu.vn',
        matKhau: 'Password@123',
      });

      expect(result.accessToken).toBe('mocked-jwt-token');
    });

    it('should throw UnauthorizedException when user not found', async () => {
      nguoiDungRepo.findOne.mockResolvedValue(null);

      await expect(
        service.dangNhap({ username: 'nonexistent', matKhau: 'Password@123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      nguoiDungRepo.findOne.mockResolvedValue(mockUser);

      await expect(
        service.dangNhap({ username: 'testuser', matKhau: 'WrongPass@1' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw ForbiddenException when account is locked', async () => {
      nguoiDungRepo.findOne.mockResolvedValue({ ...mockUser, trangThai: false });

      await expect(
        service.dangNhap({ username: 'testuser', matKhau: 'Password@123' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});