// src/dat-san/dat-san.module.ts
import { Module } from '@nestjs/common';
import { DatSanController } from './dat-san.controller';
import { DatSanService } from './dat-san.service';
import { SanBaiModule } from '../san-bai/san-bai.module';
import { LichSanModule } from '../lich-san/lich-san.module';
import { CauHinhModule } from '../cau-hinh/cau-hinh.module';

@Module({
  imports: [SanBaiModule, LichSanModule, CauHinhModule],
  controllers: [DatSanController],
  providers: [DatSanService],
})
export class DatSanModule {}