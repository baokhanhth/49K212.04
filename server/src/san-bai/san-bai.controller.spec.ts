import { Test, TestingModule } from '@nestjs/testing';
import { SanBaiController } from './san-bai.controller';

describe('SanBaiController', () => {
  let controller: SanBaiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SanBaiController],
    }).compile();

    controller = module.get<SanBaiController>(SanBaiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
