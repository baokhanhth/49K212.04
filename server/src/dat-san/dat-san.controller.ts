import { 
  Controller, 
  Get, 
  Query, 
  ParseIntPipe 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiQuery,
  ApiResponse as SwaggerResponse 
} from '@nestjs/swagger';
import { DatSanService } from './dat-san.service';
import { 
  successResponse, 
  ApiResponse 
} from '../common/interfaces/api-response.interface';

@ApiTags('dat-san')
@Controller('dat-san')
export class DatSanController {
  constructor(private readonly datSanService: DatSanService) {}

  @Get('matrix')
@ApiOperation({ summary: 'Lấy ma trận lịch trống cho sinh viên (US-08)' })
@ApiQuery({ name: 'ngay', description: 'Ngày cần xem (YYYY-MM-DD)', type: String, required: true })
@ApiQuery({ name: 'maSan', description: 'Lọc theo mã sân cụ thể', type: Number, required: false })
@ApiQuery({ name: 'maLoaiSan', description: 'Lọc theo loại sân', type: Number, required: false })
async getMatrix(
  @Query('ngay') ngay: string,
  @Query('maSan') maSan?: number,
  @Query('maLoaiSan') maLoaiSan?: number,
): Promise<ApiResponse<any>> {
  const data = await this.datSanService.getMatrix(ngay, maSan, maLoaiSan);
  return successResponse(data, 'Lấy ma trận lịch trống thành công');
}
}