import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NguoiDung } from "./entities/nguoi-dung.entity";
import { KhoaQuyenDto } from "./dto/khoa-quyen.dto";
import * as bcrypt from "bcrypt";
import { DangKyTaiKhoanDto } from "./dto/dang-ky-tai-khoan.dto";
import { DangKyResponseDto } from "./dto/dang-ky-response.dto";
import { CapNhatHoSoDto } from "./dto/cap-nhat-ho-so.dto";
import { DoiMatKhauDto } from "./dto/doi-mat-khau.dto";
import { TaoNhanVienDto } from "./dto/tao-nhan-vien.dto";
import { TaoNhanVienResponseDto } from "./dto/tao-nhan-vien-response.dto";
import * as fs from "fs";
import * as path from "path";
const MAT_KHAU_MAC_DINH = "Due@12345";
@Injectable()
export class NguoiDungService {
  constructor(
    @InjectRepository(NguoiDung)
    private readonly nguoiDungRepo: Repository<NguoiDung>
  ) {}

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

  async findOne(userId: number): Promise<NguoiDung> {
    const user = await this.nguoiDungRepo.findOne({ where: { userId } });
    if (!user)
      throw new NotFoundException(`Không tìm thấy người dùng với mã ${userId}`);
    return user;
  }

  async khoaQuyen(userId: number, dto: KhoaQuyenDto): Promise<NguoiDung> {
    const user = await this.findOne(userId);

    if (!user.trangThai) {
      throw new BadRequestException("Tài khoản này đã bị khóa quyền đặt sân");
    }

    user.trangThai = false;
    await this.nguoiDungRepo.save(user);

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

  async khoiPhucQuyen(userId: number, dto: KhoaQuyenDto): Promise<NguoiDung> {
    const user = await this.findOne(userId);

    if (user.trangThai) {
      throw new BadRequestException("Tài khoản này đang hoạt động bình thường");
    }

    user.trangThai = true;
    await this.nguoiDungRepo.save(user);

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

  async capNhatDiemUyTin(userId: number, diemMoi: number): Promise<NguoiDung> {
    const user = await this.findOne(userId);
    user.diemUyTin = diemMoi;

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
    } else if (diemMoi >= 50 && !user.trangThai) {
      user.trangThai = true;
    }

    return this.nguoiDungRepo.save(user);
  }

  async kiemTraQuyenDatSan(userId: number): Promise<boolean> {
    const user = await this.findOne(userId);
    if (!user.trangThai) {
      throw new BadRequestException(
        "Tài khoản của bạn đã bị khóa quyền đặt sân"
      );
    }
    return true;
  }

  async dangKyTaiKhoan(dto: DangKyTaiKhoanDto): Promise<DangKyResponseDto> {
    // ===== 1. Normalize dữ liệu =====
    const msvRaw = dto.msv || '';
    const msv = msvRaw.trim();
  
    const hoTen = dto.hoTen?.trim().replace(/\s+/g, ' ');
    const lop = dto.lop?.trim().toUpperCase();
    const emailTruong = dto.emailTruong?.trim().toLowerCase();
    const emailCaNhan = dto.emailCaNhan?.trim().toLowerCase();
    const matKhau = dto.matKhau?.trim();
    const xacNhanMatKhau = dto.xacNhanMatKhau?.trim();
  
    // 👉 username LUÔN = MSSV
    const username = msv;
  
    // ===== 2. Validate MSSV =====
    if (!msv) {
      throw new BadRequestException('MSSV không được để trống');
    }
  
    // ❗ Không cho có khoảng trắng ở bất kỳ đâu
    if (/\s/.test(msv)) {
      throw new BadRequestException('MSSV không được chứa khoảng trắng');
    }
  
    if (!/^\d{12}$/.test(msv)) {
      throw new BadRequestException('MSSV phải gồm đúng 12 chữ số và không được chứa khoảng trắng');
    }
  
    // ===== 3. Validate email trường =====
    const expectedEmail = `${msv}@due.udn.vn`;
  
    if (!emailTruong) {
      throw new BadRequestException('Email trường không được để trống');
    }
  
    if (emailTruong !== expectedEmail) {
      throw new BadRequestException(
        'Email trường phải có dạng MSSV + @due.udn.vn',
      );
    }
  
    // ===== 4. Validate mật khẩu =====
    if (!matKhau) {
      throw new BadRequestException('Mật khẩu không được để trống');
    }
  
    if (matKhau.length < 8) {
      throw new BadRequestException('Mật khẩu phải có ít nhất 8 ký tự');
    }
  
    // Strong password (bổ sung lại ở service)
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
  
    if (!strongPasswordRegex.test(matKhau)) {
      throw new BadRequestException(
        'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt',
      );
    }
    
 
    if (!xacNhanMatKhau) {
      throw new BadRequestException('Xác nhận mật khẩu không được để trống');
    }
  
    if (matKhau !== xacNhanMatKhau) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }
  
    // ===== 5. Validate họ tên =====
    if (!hoTen) {
      throw new BadRequestException('Họ tên không được để trống');
    }
  
    if (hoTen.length > 100) {
      throw new BadRequestException('Họ tên không được vượt quá 100 ký tự');
    }
  
    // ===== 6. Validate lớp =====
    if (!lop) {
      throw new BadRequestException('Lớp không được để trống');
    }
  
    if (lop.length > 10) {
      throw new BadRequestException('Lớp không được vượt quá 10 ký tự');
    }
  
    // ===== 7. Validate email cá nhân =====
    if (!emailCaNhan) {
      throw new BadRequestException('Email cá nhân không được để trống');
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!emailRegex.test(emailCaNhan)) {
      throw new BadRequestException('Email cá nhân không hợp lệ');
    }
  
    if (emailCaNhan.length > 80) {
      throw new BadRequestException(
        'Email cá nhân không được vượt quá 80 ký tự',
      );
    }
  
    // ===== 8. Check duplicate =====
    const [existingUser] = await Promise.all([
      this.nguoiDungRepo.findOne({
        where: [
          { username },
          { msv },
          { emailTruong },
          { emailCaNhan },
        ],
      }),
    ]);
  
    if (existingUser) {
      if (existingUser.username === username) {
        throw new BadRequestException('Username đã tồn tại');
      }
      if (existingUser.msv === msv) {
        throw new BadRequestException('MSSV đã tồn tại');
      }
      if (existingUser.emailTruong === emailTruong) {
        throw new BadRequestException('Email trường đã tồn tại');
      }
      if (existingUser.emailCaNhan === emailCaNhan) {
        throw new BadRequestException('Email cá nhân đã tồn tại');
      }
    }
  
    // ===== 9. Hash password =====
    const hashedPassword = await bcrypt.hash(matKhau, 10);
  
    // ===== 10. Tạo user =====
    const newUser = this.nguoiDungRepo.create({
      username,
      matKhau: hashedPassword,
      msv,
      lop,
      hoTen,
      emailTruong,
      emailCaNhan,
      sdt: null,
      anhDaiDien: null,
      trangThai: true,
      diemUyTin: 100,
      maVaiTro: 2,
    });
  
    try {
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
    } catch (error) {
      // fallback nếu DB vẫn bị race condition
      throw new BadRequestException(
        'Dữ liệu đã tồn tại hoặc không hợp lệ',
      );
    }
  }

  async capNhatAnhDaiDien(
    userId: number,
    duongDanAnh: string
  ): Promise<NguoiDung> {
    const user = await this.findOne(userId);

    if (user.anhDaiDien) {
      const oldFilePath = path.join(
        process.cwd(),
        user.anhDaiDien.replace(/^\/+/, "")
      );
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    user.anhDaiDien = duongDanAnh;
    await this.nguoiDungRepo.save(user);

    return this.findOne(userId);
  }

  async layHoSo(userId: number): Promise<any> {
    const user = await this.findOne(userId);

    const hoSo: any = {
      userId: user.userId,
      hoTen: user.hoTen,
      emailTruong: user.emailTruong,
      emailCaNhan: user.emailCaNhan,
      sdt: user.sdt,
      anhDaiDien: user.anhDaiDien,
      maVaiTro: user.maVaiTro,
    };

    if (user.maVaiTro === 2) {
      hoSo.msv = user.msv;
      hoSo.lop = user.lop;
      hoSo.diemUyTin = user.diemUyTin;
    }

    return hoSo;
  }

  async capNhatHoSo(userId: number, dto: CapNhatHoSoDto): Promise<any> {
    const user = await this.findOne(userId);

    if (dto.emailCaNhan !== undefined) {
      if (dto.emailCaNhan && dto.emailCaNhan.trim() !== "") {
        const existingEmail = await this.nguoiDungRepo.findOne({
          where: { emailCaNhan: dto.emailCaNhan },
        });
        if (existingEmail && existingEmail.userId !== userId) {
          throw new BadRequestException(
            "Email cá nhân đã được sử dụng bởi tài khoản khác"
          );
        }
        user.emailCaNhan = dto.emailCaNhan.trim();
      } else {
        user.emailCaNhan = null;
      }
    }

    if (dto.sdt !== undefined) {
      user.sdt = dto.sdt ? dto.sdt.trim() : null;
    }

    await this.nguoiDungRepo.save(user);

    return this.layHoSo(userId);
  }

  async doiMatKhau(userId: number, dto: DoiMatKhauDto): Promise<void> {
    const user = await this.findOne(userId);

    const isPasswordValid = await bcrypt.compare(
      dto.matKhauHienTai,
      user.matKhau
    );
    if (!isPasswordValid) {
      throw new BadRequestException("Mật khẩu hiện tại không đúng");
    }

    if (dto.matKhauMoi !== dto.xacNhanMatKhau) {
      throw new BadRequestException("Mật khẩu xác nhận không khớp");
    }

    user.matKhau = await bcrypt.hash(dto.matKhauMoi, 10);
    await this.nguoiDungRepo.save(user);
  }
  // Thêm constant mật khẩu mặc định

  async taoNhanVien(dto: TaoNhanVienDto): Promise<TaoNhanVienResponseDto> {
    const emailCaNhan = dto.emailCaNhan.trim().toLowerCase();
    const sdt = dto.sdt.trim();
    const hoTen = dto.hoTen.trim().replace(/\s+/g, " ");

    // E21.2 - Ràng buộc 4: Kiểm tra email đã tồn tại chưa (cả emailCaNhan lẫn emailTruong)
    const existingEmail = await this.nguoiDungRepo.findOne({
      where: [{ emailCaNhan }, { emailTruong: emailCaNhan }],
    });
    if (existingEmail) {
      throw new BadRequestException("Email này đã được sử dụng trong hệ thống");
    }

    // E21.2 - Ràng buộc 4: Kiểm tra SĐT đã tồn tại chưa
    const existingSdt = await this.nguoiDungRepo.findOne({ where: { sdt } });
    if (existingSdt) {
      throw new BadRequestException(
        "Số điện thoại này đã được sử dụng trong hệ thống"
      );
    }

    // E21.2 - Ràng buộc 2: Hash mật khẩu mặc định
    const hashedPassword = await bcrypt.hash(MAT_KHAU_MAC_DINH, 10);

    const newNhanVien = this.nguoiDungRepo.create({
      username: emailCaNhan, // dùng email cá nhân làm username
      matKhau: hashedPassword,
      hoTen,
      emailCaNhan,
      emailTruong: null, // nhân viên không có email trường
      sdt,
      lop: null, // nhân viên không có lớp
      msv: null, // nhân viên không có MSV
      anhDaiDien: null,
      trangThai: true, // E21.2 - Ràng buộc 3: mặc định Active
      diemUyTin: 100, // not null trong DB, fix cứng, nhân viên không dùng field này
      maVaiTro: 3, // fix cứng = nhân viên trực sân
    });

    const saved = await this.nguoiDungRepo.save(newNhanVien);

    return {
      userId: saved.userId,
      username: saved.username,
      hoTen: saved.hoTen,
      emailCaNhan: saved.emailCaNhan,
      sdt: saved.sdt,
      maVaiTro: saved.maVaiTro,
      trangThai: saved.trangThai,
      matKhauMacDinh: MAT_KHAU_MAC_DINH, // E21.2 - Ràng buộc 2: trả về để admin đọc cho nhân viên
    };
  }
}
