import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SanBaiController } from './san-bai.controller';
import { SanBaiService } from './san-bai.service';
import { SanBai } from './entities/san-bai.entity';
import { LoaiSan } from './entities/loai-san.entity';

describe('SanBaiController', () => {
  let controller: SanBaiController;

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

  const mockSanBaiService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findAllLoaiSan: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    updateTrangThai: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SanBaiController],
      providers: [{ provide: SanBaiService, useValue: mockSanBaiService }],
    }).compile();

    controller = module.get<SanBaiController>(SanBaiController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return success response with SanBai data when found', async () => {
      mockSanBaiService.findOne.mockResolvedValue(mockSanBai);

      const result = await controller.findOne(1);

      expect(mockSanBaiService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        success: true,
        message: 'Lấy thông tin sân thành công',
        data: mockSanBai,
      });
    });

    it('should throw NotFoundException when SanBai is not found', async () => {
      mockSanBaiService.findOne.mockRejectedValue(
        new NotFoundException('Không tìm thấy sân với mã 999'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should return SanBai with loaiSan relation', async () => {
      mockSanBaiService.findOne.mockResolvedValue(mockSanBai);

      const result = await controller.findOne(1);

      expect(result.data).toBeDefined();
      expect(result.data!.loaiSan).toBeDefined();
      expect(result.data!.loaiSan.tenLoaiSan).toBe('Sân 5 người');
    });

    it('should handle different SanBai IDs', async () => {
      const testIds = [1, 2, 100, 999];

      for (const id of testIds) {
        mockSanBaiService.findOne.mockResolvedValue({ ...mockSanBai, maSan: id });

        const result = await controller.findOne(id);

        expect(mockSanBaiService.findOne).toHaveBeenCalledWith(id);
        expect(result.data!.maSan).toBe(id);
      }
    });

    it('should return success: true in response', async () => {
      mockSanBaiService.findOne.mockResolvedValue(mockSanBai);

      const result = await controller.findOne(1);

      expect(result.success).toBe(true);
    });

    it('should return correct message in response', async () => {
      mockSanBaiService.findOne.mockResolvedValue(mockSanBai);

      const result = await controller.findOne(1);

      expect(result.message).toBe('Lấy thông tin sân thành công');
    });

    it('should return SanBai with all fields', async () => {
      mockSanBaiService.findOne.mockResolvedValue(mockSanBai);

      const result = await controller.findOne(1);

      expect(result.data!.maSan).toBe(1);
      expect(result.data!.tenSan).toBe('Sân A');
      expect(result.data!.hinhAnh).toBe('/uploads/san-bai/san-123.jpg');
      expect(result.data!.viTri).toBe('Khu A');
      expect(result.data!.giaThue).toBe(200000);
      expect(result.data!.trangThai).toBe('Hoạt động');
      expect(result.data!.maLoaiSan).toBe(1);
    });

    it('should pass id parameter correctly to service', async () => {
      mockSanBaiService.findOne.mockResolvedValue(mockSanBai);

      await controller.findOne(123);

      expect(mockSanBaiService.findOne).toHaveBeenCalledTimes(1);
      expect(mockSanBaiService.findOne).toHaveBeenCalledWith(123);
    });
  });
});