import { Test, TestingModule } from '@nestjs/testing';
import { VeDienTuController } from './ve-dien-tu.controller';
import { VeDienTuService } from './ve-dien-tu.service';

describe('VeDienTuController', () => {
    let controller: VeDienTuController;

    const mockVeDienTuService = {};

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [VeDienTuController],
            providers: [
                {
                    provide: VeDienTuService,
                    useValue: mockVeDienTuService,
                },
            ],
        }).compile();

        controller = module.get<VeDienTuController>(VeDienTuController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});