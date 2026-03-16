import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LichSan } from './entities/lich-san.entity';
import { LichSanService } from './lich-san.service';
import { LichSanController } from './lich-san.controller';
import { SanBai } from '../san-bai/entities/san-bai.entity';
import { KhungGio } from '../khung-gio/entities/khung-gio.entity';
import { CauHinhModule } from '../cau-hinh/cau-hinh.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LichSan, SanBai, KhungGio]),
    CauHinhModule,
  ],
  controllers: [LichSanController],
  providers: [LichSanService],
  exports: [LichSanService],
})
export class LichSanModule {}
