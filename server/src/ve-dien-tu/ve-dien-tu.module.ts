import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VeDienTuController } from './ve-dien-tu.controller';
import { VeDienTuService } from './ve-dien-tu.service';
import { VeDienTu } from './entities/ve-dien-tu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VeDienTu])],
  controllers: [VeDienTuController],
  providers: [VeDienTuService],
  exports: [VeDienTuService],
})
export class VeDienTuModule {}