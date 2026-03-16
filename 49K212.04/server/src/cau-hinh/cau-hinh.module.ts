import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CauHinhHeThong } from './entities/cau-hinh.entity';
import { CauHinhService } from './cau-hinh.service';
import { CauHinhController } from './cau-hinh.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CauHinhHeThong])],
  controllers: [CauHinhController],
  providers: [CauHinhService],
  exports: [CauHinhService],
})
export class CauHinhModule {}
