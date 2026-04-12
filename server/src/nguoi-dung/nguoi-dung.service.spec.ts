import { Test, TestingModule } from '@nestjs/testing';
import { NguoiDungService } from './nguoi-dung.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NguoiDung } from './entities/nguoi-dung.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TokenBlacklistService } from '../auth/token-blacklist.service';

describe('NguoiDungService', () => {
  let service: NguoiDungService;
  let repo: Record<string, jest.Mock>;
  let tokenBlacklistService: Record<string, jest.Mock>;

  const hashedPassword = bcrypt.hashSync('OldPass@123', 10);
  const MAT_KHAU_MAC_DINH = 'Due@12345';

  const mockSinhVien: Partial<NguoiDung> = {
    userId: 1,
    username: '231121521238',
    matKhau: hashedPassword,
    hoTen: 'Nguyen Van A',
    emailTruong: '231121521238@due.udn.vn',
    emailCaNhan: 'sinhvien1@gmail.com',
    sdt: '0905123456',
    anhDaiDien: null,
    maVaiTro: 2,
    msv: '231121521238',
    lop: '49K212.04',
    diemUyTin: 80,
    trangThai: true,
  };

  const mockNhanVien: Partial<NguoiDung> = {
    userId: 2,
    username: 'nhanvien1@gmail.com',
    matKhau: hashedPassword,
    hoTen: 'Tran Van B',
    emailTruong: null,
    emailCaNhan: 'nhanvien1@gmail.com',
    sdt: '0905654321',
    anhDaiDien: null,
    maVaiTro: 3,
    msv: null,
    lop: null,
    diemUyTin: 100,
    trangThai: true,
  };

  const mockNhanVienMoi: Partial<NguoiDung> = {
    userId: 22,
    username: 'nhanvienb@gmail.com',
    matKhau: bcrypt.hashSync(MAT_KHAU_MAC_DINH, 10),
    hoTen: 'Nguyen Van B',
    emailCaNhan: 'nhanvienb@gmail.com',
    emailTruong: null,
    sdt: '0911111111',
    msv: null,
    lop: null,
    anhDaiDien: null,
    trangThai: true,
    diemUyTin: 100,
    maVaiTro: 3,
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      create: jest.fn().mockImplementation((entity) => entity),
    };

    tokenBlacklistService = {
      blockUser: jest.fn(),
      unblockUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NguoiDungService,
        { provide: getRepositoryToken(NguoiDung), useValue: repo },
        { provide: TokenBlacklistService, useValue: tokenBlacklistService },
      ],
    }).compile();

    service = module.get<NguoiDungService>(NguoiDungService);
  });

  describe('layHoSo', () => {
    it('should return full profile with msv/lop/diemUyTin for sinh vien', async () => {
      repo.findOne.mockResolvedValue(mockSinhVien);

      const result = await service.layHoSo(1);

      expect(result.userId).toBe(1);
      expect(result.hoTen).toBe('Nguyen Van A');
      expect(result.emailTruong).toBe('231121521238@due.udn.vn');
      expect(result.emailCaNhan).toBe('sinhvien1@gmail.com');
      expect(result.msv).toBe('231121521238');
      expect(result.lop).toBe('49K212.04');
      expect(result.diemUyTin).toBe(80);
      expect(result.maVaiTro).toBe(2);
    });

    it('should return profile without msv/lop/diemUyTin for nhan vien', async () => {
      repo.findOne.mockResolvedValue(mockNhanVien);

      const result = await service.layHoSo(2);

      expect(result.userId).toBe(2);
      expect(result.hoTen).toBe('Tran Van B');
      expect(result.msv).toBeUndefined();
      expect(result.lop).toBeUndefined();
      expect(result.diemUyTin).toBeUndefined();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.layHoSo(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('capNhatHoSo', () => {
    it('should update emailCaNhan and sdt', async () => {
      repo.findOne
        .mockResolvedValueOnce(mockSinhVien)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          ...mockSinhVien,
          emailCaNhan: 'new@gmail.com',
          sdt: '0911222333',
        });

      const result = await service.capNhatHoSo(1, {
        emailCaNhan: 'new@gmail.com',
        sdt: '0911222333',
      });

      expect(repo.save).toHaveBeenCalled();
      expect(result.emailCaNhan).toBe('new@gmail.com');
      expect(result.sdt).toBe('0911222333');
    });

    it('should throw NotFoundException when user not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.capNhatHoSo(999, { emailCaNhan: 'test@gmail.com' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update only provided fields', async () => {
      repo.findOne
        .mockResolvedValueOnce(mockSinhVien)
        .mockResolvedValueOnce({
          ...mockSinhVien,
          sdt: '0999999999',
        });

      const result = await service.capNhatHoSo(1, {
        sdt: '0999999999',
      });

      expect(result.sdt).toBe('0999999999');
    });

    it('should throw BadRequestException when email is used by another user', async () => {
      repo.findOne
        .mockResolvedValueOnce(mockSinhVien)
        .mockResolvedValueOnce({
          ...mockNhanVien,
          userId: 2,
          emailCaNhan: 'taken@gmail.com',
        });

      await expect(
        service.capNhatHoSo(1, { emailCaNhan: 'taken@gmail.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow same email if it belongs to the same user', async () => {
      repo.findOne
        .mockResolvedValueOnce(mockSinhVien)
        .mockResolvedValueOnce({
          ...mockSinhVien,
          userId: 1,
          emailCaNhan: 'sinhvien1@gmail.com',
        })
        .mockResolvedValueOnce(mockSinhVien);

      await service.capNhatHoSo(1, { emailCaNhan: 'sinhvien1@gmail.com' });

      expect(repo.save).toHaveBeenCalled();
    });

    it('should set emailCaNhan to null when empty string is passed', async () => {
      repo.findOne
        .mockResolvedValueOnce(mockSinhVien)
        .mockResolvedValueOnce({ ...mockSinhVien, emailCaNhan: null });

      await service.capNhatHoSo(1, { emailCaNhan: '' });

      const savedUser = repo.save.mock.calls[0][0];
      expect(savedUser.emailCaNhan).toBeNull();
    });
  });

  describe('doiMatKhau', () => {
    it('should change password successfully', async () => {
      repo.findOne.mockResolvedValue({ ...mockSinhVien });

      await service.doiMatKhau(1, {
        matKhauHienTai: 'OldPass@123',
        matKhauMoi: 'NewPass@456',
        xacNhanMatKhau: 'NewPass@456',
      });

      expect(repo.save).toHaveBeenCalled();
      const savedUser = repo.save.mock.calls[0][0];
      const isNewPassword = await bcrypt.compare(
        'NewPass@456',
        savedUser.matKhau,
      );
      expect(isNewPassword).toBe(true);
    });

    it('should throw BadRequestException when current password is wrong', async () => {
      repo.findOne.mockResolvedValue({ ...mockSinhVien });

      await expect(
        service.doiMatKhau(1, {
          matKhauHienTai: 'WrongPass@1',
          matKhauMoi: 'NewPass@456',
          xacNhanMatKhau: 'NewPass@456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when confirmation does not match', async () => {
      repo.findOne.mockResolvedValue({ ...mockSinhVien });

      await expect(
        service.doiMatKhau(1, {
          matKhauHienTai: 'OldPass@123',
          matKhauMoi: 'NewPass@456',
          xacNhanMatKhau: 'DifferentPass@1',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.doiMatKhau(999, {
          matKhauHienTai: 'OldPass@123',
          matKhauMoi: 'NewPass@456',
          xacNhanMatKhau: 'NewPass@456',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('taoNhanVien', () => {
    it('tạo nhân viên thành công với đầy đủ thông tin', async () => {
      repo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      repo.create.mockReturnValue(mockNhanVienMoi);
      repo.save.mockResolvedValue(mockNhanVienMoi);

      const result = await service.taoNhanVien({
        hoTen: 'Nguyen Van B',
        sdt: '0911111111',
        emailCaNhan: 'nhanvienb@gmail.com',
      });

      expect(result.userId).toBe(22);
      expect(result.maVaiTro).toBe(3);
      expect(result.trangThai).toBe(true);
      expect(result.matKhauMacDinh).toBe(MAT_KHAU_MAC_DINH);
    });

    it('mật khẩu mặc định phải được hash trước khi lưu', async () => {
      repo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      repo.create.mockImplementation((entity) => entity);
      repo.save.mockImplementation((entity) =>
        Promise.resolve({ ...entity, userId: 22 }),
      );

      await service.taoNhanVien({
        hoTen: 'Nguyen Van B',
        sdt: '0911111111',
        emailCaNhan: 'nhanvienb@gmail.com',
      });

      const createdUser = repo.create.mock.calls[0][0];
      expect(createdUser.matKhau).not.toBe(MAT_KHAU_MAC_DINH);
      const isHashed = await bcrypt.compare(
        MAT_KHAU_MAC_DINH,
        createdUser.matKhau,
      );
      expect(isHashed).toBe(true);
    });

    it('ném BadRequestException khi email đã tồn tại', async () => {
      repo.findOne.mockResolvedValueOnce(mockNhanVienMoi);

      await expect(
        service.taoNhanVien({
          hoTen: 'Nguyen Van C',
          sdt: '0922222222',
          emailCaNhan: 'nhanvienb@gmail.com',
        }),
      ).rejects.toThrow('Email này đã được sử dụng trong hệ thống');
    });

    it('ném BadRequestException khi sdt đã tồn tại', async () => {
      repo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockNhanVienMoi);

      await expect(
        service.taoNhanVien({
          hoTen: 'Nguyen Van C',
          sdt: '0911111111',
          emailCaNhan: 'nhanvienC@gmail.com',
        }),
      ).rejects.toThrow('Số điện thoại này đã được sử dụng trong hệ thống');
    });

    it('maVaiTro luôn = 3', async () => {
      repo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      repo.create.mockImplementation((entity) => entity);
      repo.save.mockImplementation((entity) =>
        Promise.resolve({ ...entity, userId: 22 }),
      );

      await service.taoNhanVien({
        hoTen: 'Nguyen Van B',
        sdt: '0911111111',
        emailCaNhan: 'nhanvienb@gmail.com',
      });

      const createdUser = repo.create.mock.calls[0][0];
      expect(createdUser.maVaiTro).toBe(3);
    });

    it('trangThai = true khi tạo nhân viên mới', async () => {
      repo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      repo.create.mockImplementation((entity) => entity);
      repo.save.mockImplementation((entity) =>
        Promise.resolve({ ...entity, userId: 22 }),
      );

      await service.taoNhanVien({
        hoTen: 'Nguyen Van B',
        sdt: '0911111111',
        emailCaNhan: 'nhanvienb@gmail.com',
      });

      const createdUser = repo.create.mock.calls[0][0];
      expect(createdUser.trangThai).toBe(true);
    });

    it('email được lowercase và dùng làm username', async () => {
      repo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      repo.create.mockImplementation((entity) => entity);
      repo.save.mockImplementation((entity) =>
        Promise.resolve({ ...entity, userId: 22 }),
      );

      await service.taoNhanVien({
        hoTen: 'Nguyen Van B',
        sdt: '0911111111',
        emailCaNhan: 'NHANVIENB@GMAIL.COM',
      });

      const createdUser = repo.create.mock.calls[0][0];
      expect(createdUser.username).toBe('nhanvienb@gmail.com');
      expect(createdUser.emailCaNhan).toBe('nhanvienb@gmail.com');
    });

    it('msv, lop, emailTruong phải là null cho nhân viên', async () => {
      repo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      repo.create.mockImplementation((entity) => entity);
      repo.save.mockImplementation((entity) =>
        Promise.resolve({ ...entity, userId: 22 }),
      );

      await service.taoNhanVien({
        hoTen: 'Nguyen Van B',
        sdt: '0911111111',
        emailCaNhan: 'nhanvienb@gmail.com',
      });

      const createdUser = repo.create.mock.calls[0][0];
      expect(createdUser.msv).toBeNull();
      expect(createdUser.lop).toBeNull();
      expect(createdUser.emailTruong).toBeNull();
    });

    it('họ tên được trim và chuẩn hóa khoảng trắng thừa', async () => {
      repo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      repo.create.mockImplementation((entity) => entity);
      repo.save.mockImplementation((entity) =>
        Promise.resolve({ ...entity, userId: 22 }),
      );

      await service.taoNhanVien({
        hoTen: '  Nguyen   Van   B  ',
        sdt: '0911111111',
        emailCaNhan: 'nhanvienb@gmail.com',
      });

      const createdUser = repo.create.mock.calls[0][0];
      expect(createdUser.hoTen).toBe('Nguyen Van B');
    });
  });

  describe('dangKyTaiKhoan', () => {
    const validDto = {
      hoTen: 'Nguyen Van A',
      msv: '231121521238',
      lop: '49K212.04',
      emailTruong: '231121521238@due.udn.vn',
      matKhau: 'MatKhau@123',
      xacNhanMatKhau: 'MatKhau@123',
      emailCaNhan: 'nguyenvana@gmail.com',
    };

    const mockSavedSinhVien: Partial<NguoiDung> = {
      userId: 10,
      username: '231121521238',
      hoTen: 'Nguyen Van A',
      msv: '231121521238',
      lop: '49K212.04',
      emailTruong: '231121521238@due.udn.vn',
      emailCaNhan: 'nguyenvana@gmail.com',
      maVaiTro: 2,
      trangThai: true,
      diemUyTin: 100,
    };

    it('should register successfully with valid data', async () => {
      repo.findOne.mockResolvedValueOnce(null); // username chưa trùng
      repo.findOne.mockResolvedValueOnce(null); // msv chưa trùng
      repo.findOne.mockResolvedValueOnce(null); // email chưa trùng
      repo.findOne.mockResolvedValueOnce(null); // email cá nhân chưa trùng
      repo.create.mockImplementation((entity) => entity);
      repo.save.mockResolvedValue({
        ...mockSavedSinhVien,
        username: '231121521238',
      });

      const result = await service.dangKyTaiKhoan(validDto as any);

      expect(result.maVaiTro).toBe(2);
      expect(result.diemUyTin).toBe(100);
      expect(result.trangThai).toBe(true);
      expect(result.username).toBe('231121521238');
      expect(result.msv).toBe('231121521238');
      expect(result.hoTen).toBe('Nguyen Van A');
    });

    it('should hash password before saving', async () => {
      repo.findOne.mockResolvedValueOnce(null);
      repo.findOne.mockResolvedValueOnce(null);
      repo.findOne.mockResolvedValueOnce(null);
      repo.findOne.mockResolvedValueOnce(null);
      repo.create.mockImplementation((entity) => entity);
      repo.save.mockResolvedValue({
        ...mockSavedSinhVien,
        username: '231121521238',
      });

      await service.dangKyTaiKhoan(validDto as any);

      const createdUser = repo.create.mock.calls[0][0];
      expect(createdUser.matKhau).not.toBe('MatKhau@123');
      const isHashed = await bcrypt.compare('MatKhau@123', createdUser.matKhau);
      expect(isHashed).toBe(true);
    });

    it('should throw BadRequestException when emailTruong already exists', async () => {
      repo.findOne.mockResolvedValueOnce(null); // username chưa trùng
      repo.findOne.mockResolvedValueOnce(null); // msv chưa trùng
      repo.findOne.mockResolvedValueOnce(mockSavedSinhVien); // email đã tồn tại

      await expect(service.dangKyTaiKhoan(validDto as any)).rejects.toThrow(
        'Email đã tồn tại',
      );
    });

    it('should throw BadRequestException when msv already exists', async () => {
      repo.findOne.mockResolvedValueOnce(null); // username chưa trùng
      repo.findOne.mockResolvedValueOnce(mockSavedSinhVien); // msv đã tồn tại

      await expect(service.dangKyTaiKhoan(validDto as any)).rejects.toThrow(
        'MSSV đã tồn tại',
      );
    });

    it('should throw BadRequestException when username already exists', async () => {
      repo.findOne.mockResolvedValueOnce(mockSavedSinhVien); // username đã tồn tại

      await expect(service.dangKyTaiKhoan(validDto as any)).rejects.toThrow(
        'Username đã tồn tại',
      );
    });

    it('should throw BadRequestException when msv is not 12 digits', async () => {
      await expect(
        service.dangKyTaiKhoan({
          ...validDto,
          msv: '12345',
          emailTruong: '12345@due.udn.vn',
        } as any),
      ).rejects.toThrow(
        'MSSV phải gồm đúng 12 chữ số và không được chứa khoảng trắng',
      );
    });

    it('should throw BadRequestException when msv contains spaces', async () => {
      await expect(
        service.dangKyTaiKhoan({
          ...validDto,
          msv: '2311 21521238',
        } as any),
      ).rejects.toThrow('MSSV không được chứa khoảng trắng');
    });

    it('should throw BadRequestException when emailTruong does not match msv', async () => {
      await expect(
        service.dangKyTaiKhoan({
          ...validDto,
          emailTruong: '999999999999@due.udn.vn',
        } as any),
      ).rejects.toThrow('Email trường phải có dạng MSSV + @due.udn.vn');
    });

    it('should throw BadRequestException when password is less than 8 characters', async () => {
      await expect(
        service.dangKyTaiKhoan({
          ...validDto,
          matKhau: 'Ab@1',
          xacNhanMatKhau: 'Ab@1',
        } as any),
      ).rejects.toThrow(
        'Mật khẩu phải có ít nhất 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
      );
    });

    it('should throw BadRequestException when passwords do not match', async () => {
      await expect(
        service.dangKyTaiKhoan({
          ...validDto,
          xacNhanMatKhau: 'MatKhauKhac@123',
        } as any),
      ).rejects.toThrow('Xác nhận mật khẩu không khớp');
    });

    it('should trim input fields before saving', async () => {
      repo.findOne.mockResolvedValueOnce(null);
      repo.findOne.mockResolvedValueOnce(null);
      repo.findOne.mockResolvedValueOnce(null);
      repo.findOne.mockResolvedValueOnce(null);
      repo.create.mockImplementation((entity) => entity);
      repo.save.mockResolvedValue({
        ...mockSavedSinhVien,
        username: '231121521238',
      });

      await service.dangKyTaiKhoan({
        ...validDto,
        hoTen: '  Nguyen   Van   A  ',
      } as any);

      const createdUser = repo.create.mock.calls[0][0];
      expect(createdUser.hoTen).toBe('Nguyen Van A');
    });

    it('should set correct default values when creating account', async () => {
      repo.findOne.mockResolvedValueOnce(null);
      repo.findOne.mockResolvedValueOnce(null);
      repo.findOne.mockResolvedValueOnce(null);
      repo.findOne.mockResolvedValueOnce(null);
      repo.create.mockImplementation((entity) => entity);
      repo.save.mockResolvedValue({
        ...mockSavedSinhVien,
        username: '231121521238',
      });

      await service.dangKyTaiKhoan(validDto as any);

      const createdUser = repo.create.mock.calls[0][0];
      expect(createdUser.maVaiTro).toBe(2);
      expect(createdUser.diemUyTin).toBe(100);
      expect(createdUser.trangThai).toBe(true);
      expect(createdUser.username).toBe('231121521238');
    });

    it('should throw BadRequestException when personal email already exists', async () => {
      repo.findOne.mockResolvedValueOnce(null);
      repo.findOne.mockResolvedValueOnce(null);
      repo.findOne.mockResolvedValueOnce(null);
      repo.findOne.mockResolvedValueOnce(mockSavedSinhVien);

      await expect(service.dangKyTaiKhoan(validDto as any)).rejects.toThrow(
        'Email cá nhân đã tồn tại',
      );
    });
  });
});