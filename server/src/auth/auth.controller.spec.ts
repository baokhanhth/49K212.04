// auth/auth.controller.spec.ts
import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TokenBlacklistService } from "./token-blacklist.service";
import { JwtService } from "@nestjs/jwt";

describe("AuthController", () => {
  let controller: AuthController;
  let tokenBlacklistService: TokenBlacklistService;
  let jwtService: JwtService;

  // Token mẫu với exp = thời điểm trong tương lai
  const mockToken = "eyJhbGciOiJIUzI1NiJ9.mockpayload.signature";

  // Payload giả sau khi decode token
  const mockPayload = {
    sub: 1,
    username: "testuser",
    maVaiTro: 2,
    exp: Math.floor(Date.now() / 1000) + 3600, // còn 1 tiếng
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
      TokenBlacklistService
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  describe("dangXuat", () => {
    it("should return success message when logout", async () => {
      // E3.2: Đăng xuất thành công trả về message
      const result = await controller.dangXuat(`Bearer ${mockToken}`);
      expect(result).toEqual({ message: "Đăng xuất thành công" });
    });

    it("should add token to blacklist on logout", async () => {
      // E3.6: Token phải được blacklist sau khi logout
      await controller.dangXuat(`Bearer ${mockToken}`);

      expect(tokenBlacklistService.addToBlacklist).toHaveBeenCalledWith(
        mockToken,
        expect.any(Number) // TTL tính từ exp
      );
    });

    it("should calculate correct TTL from token exp", async () => {
      // E3.6: TTL phải tính đúng từ exp của token
      await controller.dangXuat(`Bearer ${mockToken}`);

      const callArgs = (tokenBlacklistService.addToBlacklist as jest.Mock).mock
        .calls[0];
      const ttl = callArgs[1];

      // TTL phải > 0 và <= 3600 (còn 1 tiếng)
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(3600);
    });

    it("should use default TTL when token has no exp", async () => {
      // Trường hợp token không có exp
      (jwtService.decode as jest.Mock).mockReturnValue({ sub: 1 }); // không có exp

      await controller.dangXuat(`Bearer ${mockToken}`);

      const callArgs = (tokenBlacklistService.addToBlacklist as jest.Mock).mock
        .calls[0];
      const ttl = callArgs[1];

      // Phải dùng TTL mặc định 86400 (24h)
      expect(ttl).toBe(86400);
    });

    it("should not add to blacklist when token is expired", async () => {
      // Token đã hết hạn → TTL <= 0 → không cần blacklist
      (jwtService.decode as jest.Mock).mockReturnValue({
        sub: 1,
        exp: Math.floor(Date.now() / 1000) - 100, // hết hạn 100 giây trước
      });

      await controller.dangXuat(`Bearer ${mockToken}`);

      expect(tokenBlacklistService.addToBlacklist).not.toHaveBeenCalled();
    });

    it("should return success message when no token provided", async () => {
      // Phòng thủ: không có token vẫn trả về thành công
      const result = await controller.dangXuat(undefined as any);
      expect(result).toEqual({ message: "Đăng xuất thành công" });
      expect(tokenBlacklistService.addToBlacklist).not.toHaveBeenCalled();
    });

    it("should decode token to get expiry time", async () => {
      // Kiểm tra jwtService.decode được gọi với đúng token
      await controller.dangXuat(`Bearer ${mockToken}`);
      expect(jwtService.decode).toHaveBeenCalledWith(mockToken);
    });
  });
});
