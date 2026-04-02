import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SanBaiService } from './san-bai.service';
import { SanBai } from './entities/san-bai.entity';
import { LoaiSan } from './entities/loai-san.entity';

describe('SanBaiService', () => {
  let service: SanBaiService;



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
