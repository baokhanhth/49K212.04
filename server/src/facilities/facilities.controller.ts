import { Controller, Get, Param, Query } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';

@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  findAll(@Query('maLoaiSan') maLoaiSan?: number) {
    return this.facilitiesService.findAll(maLoaiSan ? +maLoaiSan : undefined);
  }

  @Get('sport-types')
  findAllLoaiSan() {
    return this.facilitiesService.findAllLoaiSan();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.facilitiesService.findOne(+id);
  }
}