import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  // Dùng Map thay vì Set để lưu thêm thời gian hết hạn (expiresAt)
  // Map<token, expiresAt> - tránh blacklist phình to vô hạn
  private blacklist = new Map<string, number>();

  /**
   * Thêm token vào blacklist khi người dùng đăng xuất
   * @param token - JWT token cần vô hiệu hóa
   * @param ttlSeconds - Thời gian token còn hiệu lực (giây), mặc định 24h
   */
  addToBlacklist(token: string, ttlSeconds = 86400): void {
    // Bỏ qua nếu token rỗng hoặc undefined
    if (!token) return;

    // Tính thời điểm token hết hạn (milliseconds)
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.blacklist.set(token, expiresAt);

    // Dọn dẹp các token đã hết hạn sau mỗi lần thêm mới
    // tránh Map tích tụ quá nhiều token cũ gây memory leak
    this.cleanup();
  }

  /**
   * Kiểm tra token có trong blacklist không
   * @returns true nếu token đã bị vô hiệu hóa
   */
  isBlacklisted(token: string): boolean {
    const expiresAt = this.blacklist.get(token);

    // Token không có trong blacklist → hợp lệ
    if (!expiresAt) return false;

    // Token đã hết hạn tự nhiên → xóa khỏi blacklist và coi như hợp lệ
    // (token hết hạn thì passport-jwt đã tự chặn rồi, không cần giữ lại)
    if (Date.now() > expiresAt) {
      this.blacklist.delete(token);
      return false;
    }

    // Token còn hạn nhưng đã bị blacklist → vô hiệu hóa
    return true;
  }

  // ===== Force Logout: block theo userId =====
  private blockedUserIds = new Set<number>();

  blockUser(userId: number): void {
    this.blockedUserIds.add(userId);
  }

  unblockUser(userId: number): void {
    this.blockedUserIds.delete(userId);
  }

  isUserBlocked(userId: number): boolean {
    return this.blockedUserIds.has(userId);
  }

  /**
   * Dọn dẹp các token đã hết hạn khỏi Map
   * Được gọi tự động mỗi lần addToBlacklist()
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [token, expiresAt] of this.blacklist.entries()) {
      if (now > expiresAt) this.blacklist.delete(token);
    }
  }
}