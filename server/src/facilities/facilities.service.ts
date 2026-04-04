import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SanBai } from './SanBai.entity';
import { LoaiSan } from './LoaiSan.entity';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(SanBai)
    private sanBaiRepository: Repository<SanBai>,
    @InjectRepository(LoaiSan)
    private loaiSanRepository: Repository<LoaiSan>,
  ) {}

  async findAll(maLoaiSan?: number): Promise<SanBai[]> {
    const query = this.sanBaiRepository
      .createQueryBuilder('san')
      .leftJoinAndSelect('san.loaiSan', 'loaiSan');

    if (maLoaiSan) {
      query.where('san.maLoaiSan = :maLoaiSan', { maLoaiSan });
    }

    return query.getMany();
  }

  async findAllLoaiSan(): Promise<LoaiSan[]> {
    return this.loaiSanRepository.find();
  }

  async findOne(maSan: number): Promise<SanBai | null> {
    return this.sanBaiRepository
      .createQueryBuilder('san')
      .leftJoinAndSelect('san.loaiSan', 'loaiSan')
      .where('san.maSan = :maSan', { maSan })
      .getOne();
  }
}