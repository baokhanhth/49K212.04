import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';
import { SanBai } from './SanBai.entity';
import { LoaiSan } from './LoaiSan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SanBai, LoaiSan])],
  controllers: [FacilitiesController],
  providers: [FacilitiesService],
})
export class FacilitiesModule {}