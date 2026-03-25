import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { SanBai } from '../san-bai/entities/san-bai.entity';
import { DatSan } from '../lich-san/entities/dat-san.entity';
import { LichSan } from '../lich-san/entities/lich-san.entity';

// ───────────── Mock Repos ─────────────

const mockSanBaiRepo = { count: jest.fn() };

const mockDatSanRepo = {
  count: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockLichSanRepo = {
  createQueryBuilder: jest.fn(),
};

/** Helper: chainable query builder mock */
function chainQb(result: any) {
  const qb: any = {};
  const methods = [
    'select', 'addSelect', 'innerJoin', 'leftJoin',
    'leftJoinAndSelect', 'where', 'andWhere', 'groupBy',
    'addGroupBy', 'orderBy', 'addOrderBy', 'setParameter',
  ];
  methods.forEach((m) => (qb[m] = jest.fn().mockReturnValue(qb)));
  qb.getCount = jest.fn().mockResolvedValue(result);
  qb.getRawOne = jest.fn().mockResolvedValue(result);
  qb.getRawMany = jest.fn().mockResolvedValue(result);
  qb.getMany = jest.fn().mockResolvedValue(result);
  return qb;
}

describe('DashboardService (US-19)', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(SanBai), useValue: mockSanBaiRepo },
        { provide: getRepositoryToken(DatSan), useValue: mockDatSanRepo },
        { provide: getRepositoryToken(LichSan), useValue: mockLichSanRepo },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it('Service phải được khởi tạo thành công', () => {
    expect(service).toBeDefined();
  });

  // ═══════════════════════════════════════════════════
  //  E19.2 – Thống kê tổng quan
  // ═══════════════════════════════════════════════════

  describe('getThongKeTongQuan (E19.2)', () => {
    it('Trả về đúng 4 chỉ số: tongSoSan, datSanHomNay, choDuyet, doanhThuThang', async () => {
      // tongSoSan
      mockSanBaiRepo.count.mockResolvedValue(5);
      // datSanHomNay (createQueryBuilder → getCount)
      const datSanHomNayQb = chainQb(12);
      // choDuyet (count with where)
      mockDatSanRepo.count.mockResolvedValue(3);
      // doanhThuThang (createQueryBuilder → getRawOne)
      const doanhThuQb = chainQb({ total: 1500000 });

      // createQueryBuilder will be called twice: once for datSanHomNay, once for doanhThu
      mockDatSanRepo.createQueryBuilder
        .mockReturnValueOnce(datSanHomNayQb)
        .mockReturnValueOnce(doanhThuQb);

      const result = await service.getThongKeTongQuan();

      expect(result.tongSoSan).toBe(5);
      expect(result.datSanHomNay).toBe(12);
      expect(result.choDuyet).toBe(3);
      expect(result.doanhThuThang).toBe(1500000);
    });

    // E19.10 – Khi không có dữ liệu
    it('Trả về 0 cho tất cả chỉ số khi không có dữ liệu (E19.10)', async () => {
      mockSanBaiRepo.count.mockResolvedValue(0);
      mockDatSanRepo.count.mockResolvedValue(0);

      const emptyQb1 = chainQb(0);
      const emptyQb2 = chainQb({ total: null });
      mockDatSanRepo.createQueryBuilder
        .mockReturnValueOnce(emptyQb1)
        .mockReturnValueOnce(emptyQb2);

      const result = await service.getThongKeTongQuan();

      expect(result.tongSoSan).toBe(0);
      expect(result.datSanHomNay).toBe(0);
      expect(result.choDuyet).toBe(0);
      expect(result.doanhThuThang).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════
  //  E19.5 – Doanh thu chỉ tính trạng thái hợp lệ
  // ═══════════════════════════════════════════════════

  describe('Doanh thu (E19.5)', () => {
    it('Phải truyền đúng bộ trạng thái vào query: Đã thanh toán, Đã check-in, Hoàn thành', async () => {
      mockSanBaiRepo.count.mockResolvedValue(0);
      mockDatSanRepo.count.mockResolvedValue(0);

      const datSanHomNayQb = chainQb(0);
      const doanhThuQb = chainQb({ total: 0 });
      mockDatSanRepo.createQueryBuilder
        .mockReturnValueOnce(datSanHomNayQb)
        .mockReturnValueOnce(doanhThuQb);

      await service.getThongKeTongQuan();

      // Verify doanh thu query uses the correct statuses
      const whereCall = doanhThuQb.where.mock.calls[0];
      expect(whereCall[0]).toContain('IN');
      expect(whereCall[1].trangThai).toEqual([
        'Đã thanh toán',
        'Đã check-in',
        'Hoàn thành',
      ]);
    });
  });

  // ═══════════════════════════════════════════════════
  //  E19.8 – Hiệu suất
  // ═══════════════════════════════════════════════════

  describe('getHieuSuat (E19.8)', () => {
    it('Trả về mảng hiệu suất per sân', async () => {
      const qb = chainQb([
        { maSan: 1, tenSan: 'Sân 5A', soLuongBooking: '10', doanhThu: '2000000' },
        { maSan: 2, tenSan: 'Sân 7A', soLuongBooking: '5', doanhThu: '750000' },
      ]);
      mockDatSanRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getHieuSuat();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        maSan: 1,
        tenSan: 'Sân 5A',
        soLuongBooking: 10,
        doanhThu: 2000000,
      });
      expect(result[1].tenSan).toBe('Sân 7A');
    });

    it('Trả về mảng rỗng khi không có booking (E19.10)', async () => {
      const qb = chainQb([]);
      mockDatSanRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getHieuSuat();
      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════
  //  E19.9 – Lịch tổng hợp + mapTinhTrang
  // ═══════════════════════════════════════════════════

  describe('getLichTongHop (E19.9)', () => {
    function makeLich(override: Record<string, any> = {}): any {
      return {
        maLichSan: 1,
        maSan: 1,
        ngayApDung: '2026-03-20',
        gioBatDau: '08:00:00',
        gioKetThuc: '09:00:00',
        sanBai: { tenSan: 'Sân 5A', trangThai: 'Hoạt động' },
        datSan: null,
        ...override,
      };
    }

    it('Slot trống → tinhTrang = "Trống"', async () => {
      const qb = chainQb([makeLich()]);
      mockLichSanRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getLichTongHop({ cheDoXem: 'ngay', ngay: '2026-03-20' });
      expect(result[0].tinhTrang).toBe('Trống');
    });

    it('Sân bảo trì → tinhTrang = "Bảo trì"', async () => {
      const qb = chainQb([
        makeLich({ sanBai: { tenSan: 'Sân 5A', trangThai: 'Bảo trì' } }),
      ]);
      mockLichSanRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getLichTongHop({ cheDoXem: 'ngay', ngay: '2026-03-20' });
      expect(result[0].tinhTrang).toBe('Bảo trì');
    });

    it('DatSan "Chờ duyệt" → tinhTrang = "Chờ duyệt"', async () => {
      const qb = chainQb([makeLich({ datSan: { trangThai: 'Chờ duyệt' } })]);
      mockLichSanRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getLichTongHop({ cheDoXem: 'ngay', ngay: '2026-03-20' });
      expect(result[0].tinhTrang).toBe('Chờ duyệt');
    });

    it('DatSan "Đã duyệt" → tinhTrang = "Đã được đặt"', async () => {
      const qb = chainQb([makeLich({ datSan: { trangThai: 'Đã duyệt' } })]);
      mockLichSanRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getLichTongHop({ cheDoXem: 'ngay', ngay: '2026-03-20' });
      expect(result[0].tinhTrang).toBe('Đã được đặt');
    });

    it('DatSan "Đã check-in" → tinhTrang = "Đang sử dụng"', async () => {
      const qb = chainQb([makeLich({ datSan: { trangThai: 'Đã check-in' } })]);
      mockLichSanRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getLichTongHop({ cheDoXem: 'ngay', ngay: '2026-03-20' });
      expect(result[0].tinhTrang).toBe('Đang sử dụng');
    });

    it('DatSan "Hoàn thành" → tinhTrang = "Đã sử dụng xong"', async () => {
      const qb = chainQb([makeLich({ datSan: { trangThai: 'Hoàn thành' } })]);
      mockLichSanRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getLichTongHop({ cheDoXem: 'ngay', ngay: '2026-03-20' });
      expect(result[0].tinhTrang).toBe('Đã sử dụng xong');
    });

    it('DatSan "No-show" → tinhTrang = "Không sử dụng"', async () => {
      const qb = chainQb([makeLich({ datSan: { trangThai: 'No-show' } })]);
      mockLichSanRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getLichTongHop({ cheDoXem: 'ngay', ngay: '2026-03-20' });
      expect(result[0].tinhTrang).toBe('Không sử dụng');
    });

    it('Không có lịch sân → trả mảng rỗng (E19.10)', async () => {
      const qb = chainQb([]);
      mockLichSanRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getLichTongHop({ cheDoXem: 'ngay', ngay: '2026-03-20' });
      expect(result).toEqual([]);
    });

    it('cheDoXem = "tuan" → query khoảng 7 ngày', async () => {
      const qb = chainQb([]);
      mockLichSanRepo.createQueryBuilder.mockReturnValue(qb);

      await service.getLichTongHop({ cheDoXem: 'tuan', ngay: '2026-03-20' });

      // Ngày 2026-03-20 là thứ Sáu → tuần: 16/3 (T2) – 22/3 (CN)
      const whereCall = qb.where.mock.calls[0];
      expect(whereCall[1].tuNgay).toBe('2026-03-16');
      const andWhereCall = qb.andWhere.mock.calls[0];
      expect(andWhereCall[1].denNgay).toBe('2026-03-22');
    });

    it('cheDoXem = "thang" → query cả tháng', async () => {
      const qb = chainQb([]);
      mockLichSanRepo.createQueryBuilder.mockReturnValue(qb);

      await service.getLichTongHop({ cheDoXem: 'thang', ngay: '2026-03-20' });

      const whereCall = qb.where.mock.calls[0];
      expect(whereCall[1].tuNgay).toBe('2026-03-01');
      const andWhereCall = qb.andWhere.mock.calls[0];
      expect(andWhereCall[1].denNgay).toBe('2026-03-31');
    });
  });
});
