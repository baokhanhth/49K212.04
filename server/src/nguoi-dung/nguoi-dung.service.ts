import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NguoiDung } from "./entities/nguoi-dung.entity";
import { KhoaQuyenDto } from "./dto/khoa-quyen.dto";
import { TokenBlacklistService } from '../auth/token-blacklist.service';

@Injectable()
export class NguoiDungService {
  constructor(
    @InjectRepository(NguoiDung)
    private readonly nguoiDungRepo: Repository<NguoiDung>,
    private readonly blacklistService: TokenBlacklistService,
    ) {}

  // ─── E17.2: Lấy danh sách toàn bộ sinh viên (maVaiTro = 2) ──
  async findAllSinhVien(): Promise<NguoiDung[]> {
    return this.nguoiDungRepo.find({
      where: { maVaiTro: 2 },
      select: [
        "userId",
        "hoTen",
        "msv",
        "lop",
        "trangThai",
        "diemUyTin",
        "emailTruong",
      ],
      order: { userId: "ASC" },
    });
  }

  // ─── Lấy 1 người dùng theo userId, ném lỗi 404 nếu không tìm thấy ──
  async findOne(userId: number): Promise<NguoiDung> {
    const user = await this.nguoiDungRepo.findOne({ where: { userId } });
    if (!user)
      throw new NotFoundException(`Không tìm thấy người dùng với mã ${userId}`);
    return user;
  }

  // ─── E17.5: Admin khóa quyền đặt sân của sinh viên ───────────
  // trangThai = false (bit = 0) → bị khóa quyền đặt sân
  // trangThai = true  (bit = 1) → hoạt động bình thường
  async khoaQuyen(userId: number, dto: KhoaQuyenDto): Promise<NguoiDung> {
    const user = await this.findOne(userId);

    // Kiểm tra nếu đã bị khóa rồi thì không cho khóa lại
    if (!user.trangThai) {
      throw new BadRequestException("Tài khoản này đã bị khóa quyền đặt sân");
    }

    // Cập nhật trạng thái → khóa (false = 0)
    user.trangThai = false;
    await this.nguoiDungRepo.save(user);

    // E17.10: Ghi log hành động
    console.log(
      JSON.stringify({
        nguoiThucHien: dto.nguoiThucHien,
        hanhDong: "KHOA_QUYEN_DAT_SAN",
        doiTuong: userId,
        lyDo: dto.lyDo ?? null,
        thoiGian: new Date().toISOString(),
      })
    );

    return this.findOne(userId);
  }

  // ─── E17.6: Admin khôi phục quyền đặt sân cho sinh viên ──────
  async khoiPhucQuyen(userId: number, dto: KhoaQuyenDto): Promise<NguoiDung> {
    const user = await this.findOne(userId);

    // Kiểm tra nếu đang hoạt động rồi thì không cần khôi phục
    if (user.trangThai) {
      throw new BadRequestException("Tài khoản này đang hoạt động bình thường");
    }

    // Cập nhật trạng thái → hoạt động (true = 1)
    user.trangThai = true;
    await this.nguoiDungRepo.save(user);

    // E17.10: Ghi log hành động
    console.log(
      JSON.stringify({
        nguoiThucHien: dto.nguoiThucHien,
        hanhDong: "KHOI_PHUC_QUYEN_DAT_SAN",
        doiTuong: userId,
        thoiGian: new Date().toISOString(),
      })
    );

    return this.findOne(userId);
  }

  // ─── E17.7 + E17.9: Cập nhật điểm uy tín, tự động khóa nếu < 50 ──
  async capNhatDiemUyTin(userId: number, diemMoi: number): Promise<NguoiDung> {
    const user = await this.findOne(userId);
    user.diemUyTin = diemMoi;

    // E17.7: Điểm < 50 và đang hoạt động → tự động khóa quyền
    if (diemMoi < 50 && user.trangThai) {
      user.trangThai = false;
      console.log(
        JSON.stringify({
          hanhDong: "AUTO_KHOA_QUYEN",
          doiTuong: userId,
          diemUyTin: diemMoi,
          thoiGian: new Date().toISOString(),
        })
      );
    }
    // E17.9: Điểm >= 50 và đang bị khóa → tự động mở lại
    else if (diemMoi >= 50 && !user.trangThai) {
      user.trangThai = true;
    }

    return this.nguoiDungRepo.save(user);
  }

  // ─── E17.8: Kiểm tra quyền đặt sân trước khi cho đặt ────────
  // Được gọi từ DatSanService trước khi tạo đơn đặt sân
  async kiemTraQuyenDatSan(userId: number): Promise<boolean> {
    const user = await this.findOne(userId);

    // Nếu bị khóa → ném lỗi 400, không cho đặt sân
    if (!user.trangThai) {
      throw new BadRequestException(
        "Tài khoản của bạn đã bị khóa quyền đặt sân"
      );
    }
    return true;
  }

  // đăng xuất
  async logout(): Promise<void> {
    // Không cần làm gì ở server
    // Client sẽ tự xóa accessToken khỏi localStorage/cookie
    return;
}}
