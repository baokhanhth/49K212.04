import { Test, TestingModule } from '@nestjs/testing';
import { VeDienTuService } from './ve-dien-tu.service';

describe('VeDienTuService', () => {
  let service: VeDienTuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VeDienTuService],
    }).compile();

    service = module.get<VeDienTuService>(VeDienTuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
