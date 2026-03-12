// src/dat-san/dat-san.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatSanController } from './dat-san.controller';
import { DatSanService } from './dat-san.service';
import { DatSan } from '../lich-san/entities/dat-san.entity';
import { LichSan } from '../lich-san/entities/lich-san.entity';
import { LichSanModule } from '../lich-san/lich-san.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DatSan, LichSan]),
    LichSanModule,
  ],
  controllers: [DatSanController],
  providers: [DatSanService],
})
export class DatSanModule {}