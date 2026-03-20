import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SanBaiService } from './san-bai.service';
import { SanBai } from './entities/san-bai.entity';
import { LoaiSan } from './entities/loai-san.entity';

describe('SanBaiService', () => {
  let service: SanBaiService;

  const mockSanBaiRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
    manager: { createQueryBuilder: jest.fn(), find: jest.fn() },
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
});
