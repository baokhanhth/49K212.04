import { Test, TestingModule } from '@nestjs/testing';
import { DatSanService } from './dat-san.service';
import { LichSanService } from '../lich-san/lich-san.service';
import { SanBaiService } from '../san-bai/san-bai.service';
import { NotFoundException } from '@nestjs/common';

describe('DatSanService (US-08)', () => {
  let service: DatSanService;
  let lichSanService: LichSanService;

  // 1. Mock tối giản để tránh lỗi Type mismatch
  const mockLichSanService = {
    findAll: jest.fn(),
  };

  const mockSanBaiService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatSanService,
        { provide: SanBaiService, useValue: mockSanBaiService },
        { provide: LichSanService, useValue: mockLichSanService },
      ],
    }).compile();

    service = module.get<DatSanService>(DatSanService);
    lichSanService = module.get<LichSanService>(LichSanService);
    
    // Clear mock sau mỗi lần test để dữ liệu không bị chồng chéo
    jest.clearAllMocks();
  });

  // Test 1: Khởi tạo
  it('Service phải được khởi tạo thành công', () => {
    expect(service).toBeDefined();
  });

  // Test 2: Ma trận khi lọc theo ngày
  it('Nên trả về ma trận lịch đúng cấu trúc khi có dữ liệu', async () => {
    const mockData = [
      {
        maLichSan: 1,
        gioBatDau: '17:00:00',
        gioKetThuc: '18:00:00',
        sanBai: { 
          tenSan: 'Sân 5A', 
          giaThue: 200000, 
          trangThai: 'Hoạt động',
          loaiSan: { tenLoaiSan: 'Sân bóng đá' } 
        },
        datSan: null, 
      },
    ];

    mockLichSanService.findAll.mockResolvedValue(mockData);

    const result = await service.getMatrix('2026-03-08');

    expect(result).toBeDefined();
    expect(result[0].trangThai).toBe('Trống');
    expect(result[0].canBook).toBe(true);
    expect(result[0].tenSan).toBe('Sân 5A');
  });

  // Test 3: Trạng thái "Đã đặt"
  it('Nên hiển thị "Đã đặt" khi slot đã có thông tin datSan', async () => {
    const mockData = [
      {
        maLichSan: 2,
        gioBatDau: '19:00:00',
        gioKetThuc: '20:00:00',
        sanBai: { tenSan: 'Sân 5A', giaThue: 200000, trangThai: 'Hoạt động' },
        datSan: { maDatSan: 123 },
      },
    ];

    mockLichSanService.findAll.mockResolvedValue(mockData);

    const result = await service.getMatrix('2026-03-08');
    expect(result[0].trangThai).toBe('Đã đặt');
    expect(result[0].canBook).toBe(false);
  });

  // Test 4: Lọc theo loại sân (maLoaiSan)
  it('Nên lọc chính xác danh sách theo mã loại sân', async () => {
    const mockData = [
      {
        maLichSan: 1,
        sanBai: { maLoaiSan: 1, tenSan: 'Sân 5A', loaiSan: { tenLoaiSan: 'Sân bóng đá' } },
        gioBatDau: '17:00:00',
        gioKetThuc: '18:00:00',
      },
      {
        maLichSan: 2,
        sanBai: { maLoaiSan: 2, tenSan: 'Sân 7A', loaiSan: { tenLoaiSan: 'Sân bóng rổ' } },
        gioBatDau: '17:00:00',
        gioKetThuc: '18:00:00',
      },
    ];

    mockLichSanService.findAll.mockResolvedValue(mockData);

    // Test lọc loại sân 1 (Sân 5)
    const result = await service.getMatrix('2026-03-08', undefined, 1);
    
    expect(result).toHaveLength(1);
    expect(result[0].loaiSan).toBe('Sân bóng đá');
  });

  // Test 5: Lỗi không có lịch
  it('Phải ném lỗi NotFoundException khi ngày đó không có lịch nào', async () => {
    mockLichSanService.findAll.mockResolvedValue([]);

    await expect(service.getMatrix('2026-03-08')).rejects.toThrow(NotFoundException);
  });
});