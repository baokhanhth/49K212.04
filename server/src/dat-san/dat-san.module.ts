import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatSanController } from './dat-san.controller';
import { DatSanService } from './dat-san.service';
import { SanBaiModule } from '../san-bai/san-bai.module';
import { LichSanModule } from '../lich-san/lich-san.module';
import { CauHinhModule } from '../cau-hinh/cau-hinh.module';
import { DatSan } from './entities/dat-san.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DatSan]),
    SanBaiModule,
    LichSanModule,
    CauHinhModule,
  ],
  controllers: [DatSanController],
  providers: [DatSanService],
})
export class DatSanModule {}