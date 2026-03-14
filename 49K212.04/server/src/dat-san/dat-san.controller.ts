import { Controller, Post, Body, Get, Patch, Param } from '@nestjs/common';
import { DatSanService } from './dat-san.service';
import { CreateDatSanDto } from './dto/create-dat-san.dto';

@Controller('dat-san')
export class DatSanController {
  constructor(private readonly datSanService: DatSanService) {}

  // Sinh viên đặt sân
  @Post()
  create(@Body() dto: CreateDatSanDto) {
    return this.datSanService.create(dto);
  }

  // Admin duyệt
  @Patch(':id/approve')
  approve(
    @Param('id') id: number,
    @Body('adminId') adminId: number
  ) {
    return this.datSanService.approve(id, adminId);
  }

  // Admin từ chối
  @Patch(':id/reject')
  reject(
    @Param('id') id: number,
    @Body('adminId') adminId: number
  ) {
    return this.datSanService.reject(id, adminId);
  }

  // Lấy danh sách
  @Get()
  findAll() {
    return this.datSanService.findAll();
  }

  // US-10: Sinh viên hủy đặt sân
  // sinh viên chỉ được hủy khi đặt sân ở trạng thái chờ duyệt / đã duyệt
  @Patch(':id/cancel')
  cancel(
    @Param('id') id: number,
    @Body('sinhVienId') sinhVienId: number,
  ) {
    return this.datSanService.cancel(id, sinhVienId);
  }

}