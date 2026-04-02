import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NguoiDungController } from './nguoi-dung.controller';
import { NguoiDungService } from './nguoi-dung.service';
import { NguoiDung } from './entities/nguoi-dung.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([NguoiDung]),
             JwtModule.register({ secret: process.env.JWT_SECRET}),],
  controllers: [NguoiDungController],
  providers: [NguoiDungService, ],
  exports: [NguoiDungService],
})
export class NguoiDungModule {}