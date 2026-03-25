import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NguoiDung } from "./entities/nguoi-dung.entity";
import { KhoaQuyenDto } from "./dto/khoa-quyen.dto";
import * as bcrypt from 'bcrypt';
import { DangKyTaiKhoanDto } from './dto/dang-ky-tai-khoan.dto';
import { DangKyResponseDto } from './dto/dang-ky-response.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NguoiDungService {
  constructor(
    @InjectRepository(NguoiDung)
    private readonly nguoiDungRepo: Repository<NguoiDung>
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

  // dang ky tai khoan
  async dangKyTaiKhoan(dto: DangKyTaiKhoanDto): Promise<DangKyResponseDto> {
    const username = dto.username.trim().toLowerCase();
    const emailTruong = dto.emailTruong.trim().toLowerCase();
    const msv = dto.msv.trim();
    const hoTen = dto.hoTen.trim().replace(/\s+/g, ' ');
    const lop = dto.lop.trim().toUpperCase();
    const matKhau = dto.matKhau.trim();
  
    // 1. Validate MSSV (12 số)
    if (!/^\d{12}$/.test(msv)) {
      throw new BadRequestException('MSSV phải gồm đúng 12 chữ số');
    }
  
    // 2. Username phải = MSSV + @due.udn.vn
    const expectedEmail = `${msv}@due.udn.vn`;
  
    if (username !== expectedEmail) {
      throw new BadRequestException(
        'Username phải có dạng MSSV + @due.udn.vn',
      );
    }
  
    // 3. Email trường phải đúng format
    if (emailTruong !== expectedEmail) {
      throw new BadRequestException(
        'Email trường phải có dạng MSSV + @due.udn.vn',
      );
    }
  
    // 4. Username và email phải giống nhau
    if (username !== emailTruong) {
      throw new BadRequestException(
        'Username phải trùng với email trường',
      );
    }
  
    // 5. Validate mật khẩu
    if (matKhau.length < 8) {
      throw new BadRequestException(
        'Mật khẩu phải có ít nhất 8 ký tự',
      );
    }
  
    // 6. Check trùng username
    const existingUsername = await this.nguoiDungRepo.findOne({
      where: { username },
    });
    if (existingUsername) {
      throw new BadRequestException('Username đã tồn tại');
    }
  
    // 7. Check trùng MSSV
    const existingMsv = await this.nguoiDungRepo.findOne({
      where: { msv },
    });
    if (existingMsv) {
      throw new BadRequestException('MSSV đã tồn tại');
    }
  
    // 8. Check trùng email
    const existingEmail = await this.nguoiDungRepo.findOne({
      where: { emailTruong },
    });
    if (existingEmail) {
      throw new BadRequestException('Email đã tồn tại');
    }
  
    // 9. Hash password
    const hashedPassword = await bcrypt.hash(matKhau, 10);
  
    // 10. Tạo user
    const newUser = this.nguoiDungRepo.create({
      username,
      matKhau: hashedPassword,
      msv,
      lop,
      hoTen,
      emailTruong,
      sdt: null,
      emailCaNhan: null,
      anhDaiDien: null,
      trangThai: true,
      diemUyTin: 100,
      maVaiTro: 2,
    });
  
    const savedUser = await this.nguoiDungRepo.save(newUser);
  
    return {
      userId: savedUser.userId,
      username: savedUser.username,
      hoTen: savedUser.hoTen,
      msv: savedUser.msv,
      lop: savedUser.lop,
      emailTruong: savedUser.emailTruong,
      maVaiTro: savedUser.maVaiTro,
      trangThai: savedUser.trangThai,
      diemUyTin: savedUser.diemUyTin,
    };
  }
  // anh dai dien
  async capNhatAnhDaiDien(userId: number, duongDanAnh: string): Promise<NguoiDung> {
    const user = await this.findOne(userId);
  
    // Nếu đã có ảnh cũ thì xóa file cũ
    if (user.anhDaiDien) {
      const oldFilePath = path.join(process.cwd(), user.anhDaiDien.replace(/^\/+/, ''));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
  
    user.anhDaiDien = duongDanAnh;
    await this.nguoiDungRepo.save(user);
  
    return this.findOne(userId);
  }
}

