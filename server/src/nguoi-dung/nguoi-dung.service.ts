import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NguoiDung } from './entities/nguoi-dung.entity';
import { KhoaQuyenDto } from './dto/khoa-quyen.dto';
import * as bcrypt from 'bcrypt';
import { DangKyTaiKhoanDto } from './dto/dang-ky-tai-khoan.dto';
import { DangKyResponseDto } from './dto/dang-ky-response.dto';
import { CapNhatHoSoDto } from './dto/cap-nhat-ho-so.dto';
import { DoiMatKhauDto } from './dto/doi-mat-khau.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NguoiDungService {
  constructor(
    @InjectRepository(NguoiDung)
    private readonly nguoiDungRepo: Repository<NguoiDung>,
  ) { }

  async findAllSinhVien(): Promise<NguoiDung[]> {
    return this.nguoiDungRepo.find({
      where: { maVaiTro: 2 },
      select: [
        'userId',
        'hoTen',
        'msv',
        'lop',
        'trangThai',
        'diemUyTin',
        'emailTruong',
      ],
      order: { userId: 'ASC' },
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
      throw new BadRequestException('Tài khoản này đã bị khóa quyền đặt sân');
    }

    user.trangThai = false;
    await this.nguoiDungRepo.save(user);

    console.log(
      JSON.stringify({
        nguoiThucHien: dto.nguoiThucHien,
        hanhDong: 'KHOA_QUYEN_DAT_SAN',
        doiTuong: userId,
        lyDo: dto.lyDo ?? null,
        thoiGian: new Date().toISOString(),
      }),
    );

    return this.findOne(userId);
  }

  async khoiPhucQuyen(userId: number, dto: KhoaQuyenDto): Promise<NguoiDung> {
    const user = await this.findOne(userId);

    if (user.trangThai) {
      throw new BadRequestException('Tài khoản này đang hoạt động bình thường');
    }

    user.trangThai = true;
    await this.nguoiDungRepo.save(user);

    console.log(
      JSON.stringify({
        nguoiThucHien: dto.nguoiThucHien,
        hanhDong: 'KHOI_PHUC_QUYEN_DAT_SAN',
        doiTuong: userId,
        thoiGian: new Date().toISOString(),
      }),
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
          hanhDong: 'AUTO_KHOA_QUYEN',
          doiTuong: userId,
          diemUyTin: diemMoi,
          thoiGian: new Date().toISOString(),
        }),
      );
    } else if (diemMoi >= 50 && !user.trangThai) {
      user.trangThai = true;
    }

    return this.nguoiDungRepo.save(user);
  }

  async kiemTraQuyenDatSan(userId: number): Promise<boolean> {
    const user = await this.findOne(userId);
    if (!user.trangThai) {
      throw new BadRequestException('Tài khoản của bạn đã bị khóa quyền đặt sân');
    }
    return true;
  }

  async dangKyTaiKhoan(dto: DangKyTaiKhoanDto): Promise<DangKyResponseDto> {
    const username = dto.username.trim().toLowerCase();
    const emailTruong = dto.emailTruong.trim().toLowerCase();
    const msv = dto.msv.trim();
    const hoTen = dto.hoTen.trim().replace(/\s+/g, ' ');
    const lop = dto.lop.trim().toUpperCase();
    const matKhau = dto.matKhau.trim();

    if (!/^\d{12}$/.test(msv)) {
      throw new BadRequestException('MSSV phải gồm đúng 12 chữ số');
    }

    const expectedEmail = `${msv}@due.udn.vn`;

    if (username !== expectedEmail) {
      throw new BadRequestException('Username phải có dạng MSSV + @due.udn.vn');
    }

    if (emailTruong !== expectedEmail) {
      throw new BadRequestException('Email trường phải có dạng MSSV + @due.udn.vn');
    }

    if (username !== emailTruong) {
      throw new BadRequestException('Username phải trùng với email trường');
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordRegex.test(matKhau)) {
      throw new BadRequestException(
        'Mật khẩu phải có ít nhất 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
      );
    }

    const existingUsername = await this.nguoiDungRepo.findOne({ where: { username } });
    if (existingUsername) {
      throw new BadRequestException('Username đã tồn tại');
    }

    const existingMsv = await this.nguoiDungRepo.findOne({ where: { msv } });
    if (existingMsv) {
      throw new BadRequestException('MSSV đã tồn tại');
    }

    const existingEmail = await this.nguoiDungRepo.findOne({ where: { emailTruong } });
    if (existingEmail) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(matKhau, 10);

    const newUser = this.nguoiDungRepo.create({
      username,
      matKhau: hashedPassword,
      msv,
      lop,
      hoTen,
      emailTruong,
      sdt: null,
      emailCaNhan: dto.emailCaNhan.trim().toLowerCase(),
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

  async capNhatAnhDaiDien(userId: number, duongDanAnh: string): Promise<NguoiDung> {
    const user = await this.findOne(userId);

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
      if (dto.emailCaNhan && dto.emailCaNhan.trim() !== '') {
        const existingEmail = await this.nguoiDungRepo.findOne({
          where: { emailCaNhan: dto.emailCaNhan },
        });
        if (existingEmail && existingEmail.userId !== userId) {
          throw new BadRequestException('Email cá nhân đã được sử dụng bởi tài khoản khác');
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

    const isPasswordValid = await bcrypt.compare(dto.matKhauHienTai, user.matKhau);
    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    if (dto.matKhauMoi !== dto.xacNhanMatKhau) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp');
    }

    user.matKhau = await bcrypt.hash(dto.matKhauMoi, 10);
    await this.nguoiDungRepo.save(user);
  }
}

