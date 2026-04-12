import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let tokenBlacklistService: TokenBlacklistService;
  let jwtService: JwtService;

  const mockToken = 'eyJhbGciOiJIUzI1NiJ9.mockpayload.signature';

  const mockPayload = {
    sub: 1,
    username: 'testuser',
    maVaiTro: 2,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            dangNhap: jest.fn(),
          },
        },
        {
          provide: TokenBlacklistService,
          useValue: {
            addToBlacklist: jest.fn(),
            isBlacklisted: jest.fn().mockReturnValue(false),
          },
        },
        {
          provide: JwtService,
          useValue: {
            decode: jest.fn().mockReturnValue(mockPayload),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    tokenBlacklistService = module.get<TokenBlacklistService>(
      TokenBlacklistService,
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('dangXuat', () => {
    it('should return success message when logout', async () => {
      const result = await controller.dangXuat(`Bearer ${mockToken}`);

      expect(result).toEqual({
        success: true,
        message: 'Đăng xuất thành công',
        data: null,
      });
    });

    it('should add token to blacklist on logout', async () => {
      await controller.dangXuat(`Bearer ${mockToken}`);

      expect(tokenBlacklistService.addToBlacklist).toHaveBeenCalledWith(
        mockToken,
        expect.any(Number),
      );
    });

    it('should calculate correct TTL from token exp', async () => {
      await controller.dangXuat(`Bearer ${mockToken}`);

      const callArgs = (tokenBlacklistService.addToBlacklist as jest.Mock).mock
        .calls[0];
      const ttl = callArgs[1];

      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(3600);
    });

    it('should use default TTL when token has no exp', async () => {
      (jwtService.decode as jest.Mock).mockReturnValue({ sub: 1 });

      await controller.dangXuat(`Bearer ${mockToken}`);

      const callArgs = (tokenBlacklistService.addToBlacklist as jest.Mock).mock
        .calls[0];
      const ttl = callArgs[1];

      expect(ttl).toBe(86400);
    });

    it('should not add to blacklist when token is expired', async () => {
      (jwtService.decode as jest.Mock).mockReturnValue({
        sub: 1,
        exp: Math.floor(Date.now() / 1000) - 100,
      });

      await controller.dangXuat(`Bearer ${mockToken}`);

      expect(tokenBlacklistService.addToBlacklist).not.toHaveBeenCalled();
    });

    it('should return success message when no token provided', async () => {
      const result = await controller.dangXuat(undefined as any);

      expect(result).toEqual({
        success: true,
        message: 'Đăng xuất thành công',
        data: null,
      });
      expect(tokenBlacklistService.addToBlacklist).not.toHaveBeenCalled();
    });

    it('should decode token to get expiry time', async () => {
      await controller.dangXuat(`Bearer ${mockToken}`);
      expect(jwtService.decode).toHaveBeenCalledWith(mockToken);
    });
  });
});