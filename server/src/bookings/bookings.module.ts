// src/bookings/bookings.module.ts
import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { SanBaiModule } from '../san-bai/san-bai.module';
import { LichSanModule } from '../lich-san/lich-san.module';
import { CauHinhModule } from '../cau-hinh/cau-hinh.module';

@Module({
  imports: [SanBaiModule, LichSanModule, CauHinhModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}