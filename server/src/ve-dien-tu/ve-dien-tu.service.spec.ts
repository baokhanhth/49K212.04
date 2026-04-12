import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VeDienTuService } from './ve-dien-tu.service';
import { VeDienTu } from './entities/ve-dien-tu.entity';

describe('VeDienTuService', () => {
  let service: VeDienTuService;

  const mockVeDienTuRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VeDienTuService,
        {
          provide: getRepositoryToken(VeDienTu),
          useValue: mockVeDienTuRepo,
        },
      ],
    }).compile();

    service = module.get<VeDienTuService>(VeDienTuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});