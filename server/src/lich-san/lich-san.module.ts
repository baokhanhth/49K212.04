import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LichSan } from './entities/lich-san.entity';
import { DatSan } from './entities/dat-san.entity';
import { LichSanService } from './lich-san.service';
import { LichSanController } from './lich-san.controller';
import { LichSanScheduler } from './lich-san.scheduler';
import { SanBai } from '../san-bai/entities/san-bai.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LichSan, SanBai, DatSan])],
  controllers: [LichSanController],
  providers: [LichSanService, LichSanScheduler],
  exports: [LichSanService],
})
export class LichSanModule { }