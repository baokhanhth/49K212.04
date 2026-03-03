import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SanBai } from './entities/san-bai.entity';
import { LoaiSan } from './entities/loai-san.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SanBai, LoaiSan])],
  exports: [TypeOrmModule],
})
export class SanBaiModule {}
