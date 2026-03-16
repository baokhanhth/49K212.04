import { Module } from "@nestjs/common";
import { DatSanController } from "./dat-san.controller";
import { DatSanService } from "./dat-san.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatSan } from "./entities/dat-san.entity";
import { LichSan } from "../lich-san/entities/lich-san.entity";
import { SanBai } from "../san-bai/entities/san-bai.entity";
import { ChiTietDatSan } from "../chi-tiet-dat-san/entities/chi-tiet-dat-san.entity";

@Module({
  controllers: [DatSanController],
  providers: [DatSanService],
  imports: [
      TypeOrmModule.forFeature([
      DatSan,
      LichSan,
      SanBai,
      ChiTietDatSan
    ])
  ],
  
})
export class DatSanModule {}
