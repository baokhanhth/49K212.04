import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SanBaiService } from './san-bai.service';
import { SanBai } from './entities/san-bai.entity';
import { LoaiSan } from './entities/loai-san.entity';
import { Repository } from 'typeorm';

describe('SanBaiService', () => {
  let service: SanBaiService;
  let sanBaiRepo: jest.Mocked<Repository<SanBai>>;
  let loaiSanRepo: jest.Mocked<Repository<LoaiSan>>;

  const mockLoaiSan: LoaiSan = {
    maLoaiSan: 1,
    tenLoaiSan: 'Sân 5 người',
    sanBaiList: [],
  };

  const mockSanBai: SanBai = {
    maSan: 1,
    tenSan: 'Sân A',
    hinhAnh: '/uploads/san-bai/san-123.jpg',
    viTri: 'Khu A',
    giaThue: 200000,
    trangThai: 'Hoạt động',
    maLoaiSan: 1,
    loaiSan: mockLoaiSan,
    lichSanList: [],
  };

  const mockSanBaiRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    manager: {
      createQueryBuilder: jest.fn(),
      find: jest.fn(),
    },
  };

  const mockLoaiSanRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SanBaiService,
        { provide: getRepositoryToken(SanBai), useValue: mockSanBaiRepo },
        { provide: getRepositoryToken(LoaiSan), useValue: mockLoaiSanRepo },
      ],
    }).compile();

    service = module.get<SanBaiService>(SanBaiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ───────────── Tests for findOne (Xem chi tiết sân bãi) ─────────────

  describe('findOne', () => {
    it('should return a SanBai with loaiSan relation when found', async () => {
      mockSanBaiRepo.findOne.mockResolvedValue(mockSanBai);

      const result = await service.findOne(1);

      expect(sanBaiRepo.findOne).toHaveBeenCalledWith({
        where: { maSan: 1 },
        relations: ['loaiSan'],
      });
      expect(result).toEqual(mockSanBai);
      expect(result.maSan).toBe(1);
      expect(result.tenSan).toBe('Sân A');
      expect(result.loaiSan).toBeDefined();
      expect(result.loaiSan.tenLoaiSan).toBe('Sân 5 người');
    });

    it('should throw NotFoundException when SanBai is not found', async () => {
      mockSanBaiRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Không tìm thấy sân với mã 999',
      );
    });

    it('should return SanBai with all fields populated', async () => {
      const fullSanBai: SanBai = {
        ...mockSanBai,
        hinhAnh: '/uploads/san-bai/san-test.jpg',
        viTri: 'Khu B',
        giaThue: 250000,
        trangThai: 'Hoạt động',
      };

      mockSanBaiRepo.findOne.mockResolvedValue(fullSanBai);

      const result = await service.findOne(1);

      expect(result.hinhAnh).toBe('/uploads/san-bai/san-test.jpg');
      expect(result.viTri).toBe('Khu B');
      expect(result.giaThue).toBe(250000);
      expect(result.trangThai).toBe('Hoạt động');
    });

    it('should return SanBai with null hinhAnh and viTri when not set', async () => {
      const sanBaiWithoutOptional: SanBai = {
        ...mockSanBai,
        hinhAnh: null,
        viTri: null,
      };

      mockSanBaiRepo.findOne.mockResolvedValue(sanBaiWithoutOptional);

      const result = await service.findOne(1);

      expect(result.hinhAnh).toBeNull();
      expect(result.viTri).toBeNull();
    });

    it('should return SanBai with different trangThai values', async () => {
      const trangThaiList = ['Hoạt động', 'Bảo trì', 'Không hoạt động'];

      for (const trangThai of trangThaiList) {
        const sanBaiWithStatus: SanBai = {
          ...mockSanBai,
          trangThai,
        };

        mockSanBaiRepo.findOne.mockResolvedValue(sanBaiWithStatus);

        const result = await service.findOne(1);

        expect(result.trangThai).toBe(trangThai);
      }
    });

    it('should handle numeric id parameter correctly', async () => {
      mockSanBaiRepo.findOne.mockResolvedValue(mockSanBai);

      await service.findOne(123);

      expect(sanBaiRepo.findOne).toHaveBeenCalledWith({
        where: { maSan: 123 },
        relations: ['loaiSan'],
      });
    });

    it('should include loaiSan relation in the query', async () => {
      mockSanBaiRepo.findOne.mockResolvedValue(mockSanBai);

      await service.findOne(1);

      const findOneCall = mockSanBaiRepo.findOne.mock.calls[0][0];
      expect(findOneCall.relations).toContain('loaiSan');
    });
  });
});