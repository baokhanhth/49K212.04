import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SanBai } from '../san-bai/entities/san-bai.entity';
import { DatSan } from '../lich-san/entities/dat-san.entity';
import { LichSan } from '../lich-san/entities/lich-san.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SanBai, DatSan, LichSan])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
