import { Test, TestingModule } from '@nestjs/testing';
import { SanBaiController } from './san-bai.controller';
import { SanBaiService } from './san-bai.service';

describe('SanBaiController', () => {
  let controller: SanBaiController;

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
      providers: [
        { provide: SanBaiService, useValue: mockSanBaiService },
      ],
    }).compile();

    controller = module.get<SanBaiController>(SanBaiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
