import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInController } from './check-in.controller';
import { CheckInService } from './check-in.service';
import { DatSan } from '../lich-san/entities/dat-san.entity';
import { LichSan } from '../lich-san/entities/lich-san.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DatSan, LichSan])],
  controllers: [CheckInController],
  providers: [CheckInService],
})
export class CheckInModule {}
