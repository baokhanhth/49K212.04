import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KhungGio } from './entities/khung-gio.entity';
import { KhungGioService } from './khung-gio.service';
import { KhungGioController } from './khung-gio.controller';

@Module({
  imports: [TypeOrmModule.forFeature([KhungGio])],
  controllers: [KhungGioController],
  providers: [KhungGioService],
  exports: [KhungGioService],
})
export class KhungGioModule {}
