import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { LichSanService } from '../lich-san/lich-san.service';
import { SanBaiService } from '../san-bai/san-bai.service';
import { NotFoundException } from '@nestjs/common';

describe('BookingsService (US-08 - Lấy Ma trận Lịch trống)', () => {
  let service: BookingsService;
  let lichSanService: LichSanService;
  let sanBaiService: SanBaiService;

  // 1. Tạo bản giả lập (Mock) cho các Service của Trinh
  const mockSanBaiService = {
    findOne: jest.fn(),
  };

  const mockLichSanService = {
    findAllChoSinhVien: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        { provide: SanBaiService, useValue: mockSanBaiService },
        { provide: LichSanService, useValue: mockLichSanService },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    lichSanService = module.get<LichSanService>(LichSanService);
    sanBaiService = module.get<SanBaiService>(SanBaiService);
  });

  it('Nên được khởi tạo thành công', () => {
    expect(service).toBeDefined();
  });

  // Test Case quan trọng nhất: Map dữ liệu ra ma trận
  it('Nên trả về danh sách ma trận lịch đúng format (US-08)', async () => {
    // Giả lập dữ liệu Sân của Trinh
    mockSanBaiService.findOne.mockResolvedValue({
      maSan: 1,
      tenSan: 'Sân 5A',
      giaThue: 200000,
      trangThai: 'Hoạt động',
    });

    // Giả lập dữ liệu Lịch của Trinh
    mockLichSanService.findAllChoSinhVien.mockResolvedValue([
      {
        maLichSan: 101,
        trangThai: 'Trống',
        khungGio: { gioBatDau: '17:00', gioKetThuc: '18:30' },
      },
    ]);

    const result = await service.getMatrix(1, '2026-03-10');

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('trangThai', 'Trống');
    expect(result[0].khungGio).toBe('17:00 - 18:30');
    expect(result[0].canBook).toBe(true);
  });

  // Test Case logic: Sân bảo trì thì không được đặt
  it('Nên hiển thị trạng thái Bảo trì nếu sân đang bảo trì', async () => {
    mockSanBaiService.findOne.mockResolvedValue({ trangThai: 'Bảo trì', giaThue: 200000 });
    mockLichSanService.findAllChoSinhVien.mockResolvedValue([
      { maLichSan: 102, khungGio: { gioBatDau: '19:00', gioKetThuc: '20:30' } },
    ]);

    const result = await service.getMatrix(1, '2026-03-10');
    expect(result[0].trangThai).toBe('Bảo trì');
    expect(result[0].canBook).toBe(false);
  });
});