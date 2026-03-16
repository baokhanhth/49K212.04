import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SanBai } from './entities/san-bai.entity';@Injectable()
export class SanBaiService {
    constructor(
        @InjectRepository(SanBai)
        private sanBaiRepository: Repository<SanBai>,
      ) {}
    
      async chiTietSanBai(id: number) {
    
        const san = await this.sanBaiRepository.findOne({
          where: { maSan: id },
          relations: ['loaiSan'],
        });
    
        if (!san) {
          return { message: 'Không tìm thấy sân' };
        }
    
        return {
          maSan: san.maSan,
          tenSan: san.tenSan,
          hinhAnh: san.hinhAnh,
          viTri: san.viTri,
          giaThue: san.giaThue,
          trangThai: san.trangThai,
          loaiSan: san.loaiSan.tenLoaiSan
        };
    
      }
      async updateAnhSan(id: number, path: string) {
        await this.sanBaiRepository.update(id, {
          hinhAnh: path,
        });
      }
}
