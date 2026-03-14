import { Test, TestingModule } from "@nestjs/testing";
import { DatSanController } from "./dat-san.controller";

describe("DatSanController", () => {
  let controller: DatSanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatSanController],
    }).compile();

    controller = module.get<DatSanController>(DatSanController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
