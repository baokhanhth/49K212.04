import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CheckInService } from './check-in.service';
import { DatSan } from '../lich-san/entities/dat-san.entity';
import { LichSan } from '../lich-san/entities/lich-san.entity';

// ───────────── Helpers ─────────────

/** Tạo mock DatSan + LichSan cho test */
function makeDatSan(overrides: Record<string, any> = {}): DatSan {
  const defaultLichSan = {
    maLichSan: 100,
    maSan: 1,
    ngayApDung: new Date().toISOString().split('T')[0], // hôm nay
    gioBatDau: '08:00:00',
    gioKetThuc: '09:00:00',
    sanBai: {
      maSan: 1,
      tenSan: 'Sân 5A',
      giaThue: 200000,
      trangThai: 'Hoạt động',
      loaiSan: { maLoaiSan: 1, tenLoaiSan: 'Sân 5 người' },
    },
    datSan: null,
  };

  const lichSan = overrides.lichSan
    ? { ...defaultLichSan, ...overrides.lichSan }
    : defaultLichSan;

  const { lichSan: _, ...rest } = overrides;

  return {
    maDatSan: 1,
    userId: 10,
    maLichSan: 100,
    ngayDat: new Date(),
    tongTien: 200000,
    trangThai: 'Đã duyệt',
    nguoiDuyet: 2,
    lichSan,
    ...rest,
  } as DatSan;
}

/** Giờ hiện tại + offset phút, format HH:mm:ss */
function gioHienTaiOffset(offsetMinutes: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - offsetMinutes);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}:00`;
}

// ───────────── Tests ─────────────

describe('CheckInService (US-15)', () => {
  let service: CheckInService;

  const mockDatSanRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockLichSanRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckInService,
        { provide: getRepositoryToken(DatSan), useValue: mockDatSanRepo },
        { provide: getRepositoryToken(LichSan), useValue: mockLichSanRepo },
      ],
    }).compile();

    service = module.get<CheckInService>(CheckInService);
    jest.clearAllMocks();
  });

  it('Service phải được khởi tạo thành công', () => {
    expect(service).toBeDefined();
  });

  // ═══════════════════════════════════════════════════
  //  E15.2 – getThongTinVe
  // ═══════════════════════════════════════════════════

  describe('getThongTinVe (E15.2)', () => {
    it('Trả về thông tin vé đầy đủ khi QR hợp lệ', async () => {
      const datSan = makeDatSan();
      mockDatSanRepo.findOne.mockResolvedValue(datSan);

      const result = await service.getThongTinVe(1);

      expect(result.maDatSan).toBe(1);
      expect(result.userId).toBe(10);
      expect(result.tenSan).toBe('Sân 5A');
      expect(result.loaiSan).toBe('Sân 5 người');
      expect(result.trangThai).toBe('Đã duyệt');
      expect(result.coTheCheckIn).toBe(true);
      expect(result.khungGio).toBe('08:00 - 09:00');
    });

    it('coTheCheckIn = false khi trạng thái không phải "Đã duyệt"', async () => {
      const datSan = makeDatSan({ trangThai: 'Chờ duyệt' });
      mockDatSanRepo.findOne.mockResolvedValue(datSan);

      const result = await service.getThongTinVe(1);
      expect(result.coTheCheckIn).toBe(false);
    });

    it('Ném NotFoundException khi mã đặt sân không tồn tại (E15.5)', async () => {
      mockDatSanRepo.findOne.mockResolvedValue(null);

      await expect(service.getThongTinVe(999)).rejects.toThrow(NotFoundException);
      await expect(service.getThongTinVe(999)).rejects.toThrow('QR không hợp lệ!');
    });
  });

  // ═══════════════════════════════════════════════════
  //  E15.3 – Check-in thành công
  // ═══════════════════════════════════════════════════

  describe('checkIn – thành công (E15.3)', () => {
    it('Check-in đúng giờ → trạng thái "Đã check-in", điểm uy tín +10', async () => {
      // Đặt giờ bắt đầu = 5 phút trước (đúng giờ)
      const datSan = makeDatSan({
        lichSan: { gioBatDau: gioHienTaiOffset(5), gioKetThuc: gioHienTaiOffset(-55) },
      });
      mockDatSanRepo.findOne.mockResolvedValue(datSan);
      mockDatSanRepo.save.mockResolvedValue(datSan);

      const result = await service.checkIn(1);

      expect(result.trangThai).toBe('Đã check-in');
      expect(result.diemUyTin).toBe(10);
      expect(result.message).toBe('Check-in thành công!');
      expect(mockDatSanRepo.save).toHaveBeenCalled();
    });

    it('Check-in trễ 15 phút (≤ 20) → vẫn thành công', async () => {
      const datSan = makeDatSan({
        lichSan: { gioBatDau: gioHienTaiOffset(15), gioKetThuc: gioHienTaiOffset(-45) },
      });
      mockDatSanRepo.findOne.mockResolvedValue(datSan);
      mockDatSanRepo.save.mockResolvedValue(datSan);

      const result = await service.checkIn(1);

      expect(result.trangThai).toBe('Đã check-in');
      expect(result.diemUyTin).toBe(10);
    });

    it('Check-in trễ đúng 20 phút → vẫn thành công', async () => {
      const datSan = makeDatSan({
        lichSan: { gioBatDau: gioHienTaiOffset(20), gioKetThuc: gioHienTaiOffset(-40) },
      });
      mockDatSanRepo.findOne.mockResolvedValue(datSan);
      mockDatSanRepo.save.mockResolvedValue(datSan);

      const result = await service.checkIn(1);

      expect(result.trangThai).toBe('Đã check-in');
      expect(result.diemUyTin).toBe(10);
    });
  });

  // ═══════════════════════════════════════════════════
  //  E15.4 – Check-in trễ > 20 phút → No-show
  // ═══════════════════════════════════════════════════

  describe('checkIn – trễ quá 20 phút (E15.4)', () => {
    it('Trễ 30 phút → No-show, điểm uy tín -10', async () => {
      const datSan = makeDatSan({
        lichSan: { gioBatDau: gioHienTaiOffset(30), gioKetThuc: gioHienTaiOffset(-30) },
      });
      mockDatSanRepo.findOne.mockResolvedValue(datSan);
      mockDatSanRepo.save.mockResolvedValue(datSan);

      const result = await service.checkIn(1);

      expect(result.trangThai).toBe('No-show');
      expect(result.diemUyTin).toBe(-10);
      expect(result.message).toContain('No-show');
    });
  });

  // ═══════════════════════════════════════════════════
  //  E15.5 – QR không hợp lệ
  // ═══════════════════════════════════════════════════

  describe('checkIn – QR không hợp lệ (E15.5)', () => {
    it('Mã đặt sân không tồn tại → NotFoundException', async () => {
      mockDatSanRepo.findOne.mockResolvedValue(null);

      await expect(service.checkIn(999)).rejects.toThrow(NotFoundException);
      await expect(service.checkIn(999)).rejects.toThrow('QR không hợp lệ!');
    });

    it('Trạng thái "No-show" → BadRequestException', async () => {
      const datSan = makeDatSan({ trangThai: 'No-show' });
      mockDatSanRepo.findOne.mockResolvedValue(datSan);

      await expect(service.checkIn(1)).rejects.toThrow(BadRequestException);
    });

    it('Trạng thái "Chờ duyệt" → BadRequestException', async () => {
      const datSan = makeDatSan({ trangThai: 'Chờ duyệt' });
      mockDatSanRepo.findOne.mockResolvedValue(datSan);

      await expect(service.checkIn(1)).rejects.toThrow(BadRequestException);
      await expect(service.checkIn(1)).rejects.toThrow('Chỉ vé "Đã duyệt" mới được check-in');
    });

    it('Trạng thái "Bị từ chối" → BadRequestException', async () => {
      const datSan = makeDatSan({ trangThai: 'Bị từ chối' });
      mockDatSanRepo.findOne.mockResolvedValue(datSan);

      await expect(service.checkIn(1)).rejects.toThrow(BadRequestException);
    });
  });

  // ═══════════════════════════════════════════════════
  //  E15.7 – Trùng check-in
  // ═══════════════════════════════════════════════════

  describe('checkIn – trùng check-in (E15.7)', () => {
    it('Đã check-in rồi → BadRequestException, không cho check-in lại', async () => {
      const datSan = makeDatSan({ trangThai: 'Đã check-in' });
      mockDatSanRepo.findOne.mockResolvedValue(datSan);

      await expect(service.checkIn(1)).rejects.toThrow(BadRequestException);
      await expect(service.checkIn(1)).rejects.toThrow(
        'Vé đã được check-in trước đó, không thể check-in lại.',
      );
      expect(mockDatSanRepo.save).not.toHaveBeenCalled();
    });
  });
});
