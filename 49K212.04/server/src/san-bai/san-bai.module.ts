import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SanBai } from './entities/san-bai.entity';
import { LoaiSan } from './entities/loai-san.entity';
import { SanBaiService } from './san-bai.service';
import { SanBaiController } from './san-bai.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SanBai, LoaiSan])],
  exports: [TypeOrmModule],
  providers: [SanBaiService],
  controllers: [SanBaiController],
})
export class SanBaiModule {}
