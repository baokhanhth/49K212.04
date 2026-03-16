import { Test, TestingModule } from "@nestjs/testing";
import { DatSanService } from "./dat-san.service";

describe("DatSanService", () => {
  let service: DatSanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatSanService],
    }).compile();

    service = module.get<DatSanService>(DatSanService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
