import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KhungGio } from './entities/khung-gio.entity';
import { CreateKhungGioDto } from './dto/create-khung-gio.dto';
import { UpdateKhungGioDto } from './dto/update-khung-gio.dto';

@Injectable()
export class KhungGioService {
  constructor(
    @InjectRepository(KhungGio)
    private readonly khungGioRepo: Repository<KhungGio>,
  ) {}

  async findAll(): Promise<KhungGio[]> {
    return this.khungGioRepo.find({
      order: { gioBatDau: 'ASC' },
    });
  }

  async findOne(id: number): Promise<KhungGio> {
    const khungGio = await this.khungGioRepo.findOne({
      where: { maKhungGio: id },
    });
    if (!khungGio) {
      throw new NotFoundException(`Không tìm thấy khung giờ với mã ${id}`);
    }
    return khungGio;
  }

  async create(dto: CreateKhungGioDto): Promise<KhungGio> {
    if (dto.gioBatDau >= dto.gioKetThuc) {
      throw new BadRequestException(
        'Giờ bắt đầu phải nhỏ hơn giờ kết thúc',
      );
    }

    const existing = await this.khungGioRepo.findOne({
      where: {
        gioBatDau: dto.gioBatDau,
        gioKetThuc: dto.gioKetThuc,
      },
    });
    if (existing) {
      throw new BadRequestException('Khung giờ này đã tồn tại');
    }

    const khungGio = this.khungGioRepo.create(dto);
    return this.khungGioRepo.save(khungGio);
  }

  async update(id: number, dto: UpdateKhungGioDto): Promise<KhungGio> {
    const khungGio = await this.findOne(id);

    const gioBatDau = dto.gioBatDau ?? khungGio.gioBatDau;
    const gioKetThuc = dto.gioKetThuc ?? khungGio.gioKetThuc;

    if (gioBatDau >= gioKetThuc) {
      throw new BadRequestException(
        'Giờ bắt đầu phải nhỏ hơn giờ kết thúc',
      );
    }

    Object.assign(khungGio, dto);
    return this.khungGioRepo.save(khungGio);
  }

  async remove(id: number): Promise<void> {
    const khungGio = await this.findOne(id);
    await this.khungGioRepo.remove(khungGio);
  }
}
