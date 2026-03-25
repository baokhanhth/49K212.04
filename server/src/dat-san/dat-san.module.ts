import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatSanController } from './dat-san.controller';
import { DatSanService } from './dat-san.service';
import { DatSan } from '../lich-san/entities/dat-san.entity';
import { LichSan } from '../lich-san/entities/lich-san.entity';
import { SanBaiModule } from '../san-bai/san-bai.module';
import { LichSanModule } from '../lich-san/lich-san.module';
import { VeDienTuModule } from '../ve-dien-tu/ve-dien-tu.module';
import { NguoiDungModule } from '../nguoi-dung/nguoi-dung.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([DatSan, LichSan]),
    SanBaiModule,
    LichSanModule,
    VeDienTuModule,
    NguoiDungModule,
  ],
  controllers: [DatSanController],
  providers: [DatSanService],
})
export class DatSanModule {}