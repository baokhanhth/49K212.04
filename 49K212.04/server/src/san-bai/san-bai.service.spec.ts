import { Test, TestingModule } from '@nestjs/testing';
import { SanBaiService } from './san-bai.service';

describe('SanBaiService', () => {
  let service: SanBaiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SanBaiService],
    }).compile();

    service = module.get<SanBaiService>(SanBaiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
