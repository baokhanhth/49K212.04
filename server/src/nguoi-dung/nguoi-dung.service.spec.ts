import { Test, TestingModule } from '@nestjs/testing';
import { NguoiDungService } from './nguoi-dung.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NguoiDung } from './entities/nguoi-dung.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('NguoiDungService', () => {
  let service: NguoiDungService;
  let repo: Record<string, jest.Mock>;

  const hashedPassword = bcrypt.hashSync('OldPass@123', 10);

  const mockSinhVien: Partial<NguoiDung> = {
    userId: 1,
    username: 'sinhvien1',
    matKhau: hashedPassword,
    hoTen: 'Nguyen Van A',
    emailTruong: 'sinhvien1@due.edu.vn',
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
    username: 'nhanvien1',
    matKhau: hashedPassword,
    hoTen: 'Tran Van B',
    emailTruong: 'nhanvien1@due.edu.vn',
    emailCaNhan: 'nhanvien1@gmail.com',
    sdt: '0905654321',
    anhDaiDien: null,
    maVaiTro: 3,
    msv: null,
    lop: null,
    diemUyTin: undefined,
    trangThai: true,
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      create: jest.fn().mockImplementation((entity) => entity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NguoiDungService,
        { provide: getRepositoryToken(NguoiDung), useValue: repo },
      ],
    }).compile();

    service = module.get<NguoiDungService>(NguoiDungService);
  });

  describe('layHoSo', () => {
    it('should return full profile with msv/lop/diemUyTin for sinh vien (maVaiTro=2)', async () => {
      repo.findOne.mockResolvedValue(mockSinhVien);

      const result = await service.layHoSo(1);

      expect(result.userId).toBe(1);
      expect(result.hoTen).toBe('Nguyen Van A');
      expect(result.emailTruong).toBe('sinhvien1@due.edu.vn');
      expect(result.emailCaNhan).toBe('sinhvien1@gmail.com');
      expect(result.msv).toBe('231121521238');
      expect(result.lop).toBe('49K212.04');
      expect(result.diemUyTin).toBe(80);
      expect(result.maVaiTro).toBe(2);
    });

    it('should return profile without msv/lop/diemUyTin for nhan vien (maVaiTro=3)', async () => {
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
        .mockResolvedValueOnce({ ...mockSinhVien, emailCaNhan: 'new@gmail.com', sdt: '0911222333' });

      const result = await service.capNhatHoSo(1, {
        emailCaNhan: 'new@gmail.com',
        sdt: '0911222333',
      });

      expect(repo.save).toHaveBeenCalled();
      expect(result.emailCaNhan).toBe('new@gmail.com');
    });

    it('should throw BadRequestException when email is used by another user', async () => {
      repo.findOne
        .mockResolvedValueOnce(mockSinhVien)
        .mockResolvedValueOnce({ ...mockNhanVien, emailCaNhan: 'taken@gmail.com' });

      await expect(
        service.capNhatHoSo(1, { emailCaNhan: 'taken@gmail.com' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow same email if it belongs to the same user', async () => {
      repo.findOne
        .mockResolvedValueOnce(mockSinhVien)
        .mockResolvedValueOnce({ ...mockSinhVien, emailCaNhan: 'sinhvien1@gmail.com' })
        .mockResolvedValueOnce(mockSinhVien);

      const result = await service.capNhatHoSo(1, {
        emailCaNhan: 'sinhvien1@gmail.com',
      });

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
      const isNewPassword = await bcrypt.compare('NewPass@456', savedUser.matKhau);
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
});
