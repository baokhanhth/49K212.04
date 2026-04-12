import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiResponse as SwaggerResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SanBaiService } from './san-bai.service';
import { CreateSanBaiDto } from './dto/create-san-bai.dto';
import { UpdateSanBaiDto } from './dto/update-san-bai.dto';
import { QuerySanBaiDto } from './dto/query-san-bai.dto';
import {
  successResponse,
  ApiResponse,
} from '../common/interfaces/api-response.interface';
import { SanBai } from './entities/san-bai.entity';
import { LoaiSan } from './entities/loai-san.entity';

// Fix: handled merge conflict cleanup (Phuc)

// Cấu hình multer cho upload hình ảnh
const imageStorage = diskStorage({
  destination: './uploads/san-bai',
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `san-${uniqueSuffix}${ext}`);
  },
});

const imageFileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    cb(
      new Error('Chỉ chấp nhận file hình ảnh (jpg, jpeg, png, gif, webp)'),
      false,
    );
  } else {
    cb(null, true);
  }
};

@ApiTags('san-bai')
@Controller('san-bai')
export class SanBaiController {
  constructor(private readonly sanBaiService: SanBaiService) { }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sân bãi' })
  @SwaggerResponse({ status: 200, description: 'Danh sách sân bãi' })
  async findAll(@Query() query: QuerySanBaiDto): Promise<ApiResponse<SanBai[]>> {
    const data = await this.sanBaiService.findAll(query);
    return successResponse(data, 'Lấy danh sách sân bãi thành công');
  }

  @Get('loai-san')
  @ApiOperation({ summary: 'Lấy danh sách loại sân (dropdown)' })
  @SwaggerResponse({ status: 200, description: 'Danh sách loại sân' })
  async findAllLoaiSan(): Promise<ApiResponse<LoaiSan[]>> {
    const data = await this.sanBaiService.findAllLoaiSan();
    return successResponse(data, 'Lấy danh sách loại sân thành công');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết sân bãi' })
  @ApiParam({ name: 'id', description: 'Mã sân', type: Number })
  @SwaggerResponse({ status: 200, description: 'Chi tiết sân bãi' })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy sân' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<SanBai>> {
    const data = await this.sanBaiService.findOne(id);
    return successResponse(data, 'Lấy thông tin sân thành công');
  }

  @Post()
  @ApiOperation({ summary: 'Thêm sân bãi mới' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['tenSan', 'maLoaiSan', 'giaThue'],
      properties: {
        tenSan: { type: 'string', description: 'Tên sân' },
        maLoaiSan: { type: 'number', description: 'Mã loại sân' },
        giaThue: { type: 'number', description: 'Giá thuê mỗi khung giờ' },
        viTri: { type: 'string', description: 'Vị trí sân' },
        trangThai: {
          type: 'string',
          enum: ['Hoạt động', 'Bảo trì', 'Không hoạt động'],
        },
        hinhAnh: {
          type: 'string',
          format: 'binary',
          description: 'File hình ảnh',
        },
      },
    },
  })
  @SwaggerResponse({ status: 201, description: 'Tạo sân thành công' })
  @SwaggerResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @UseInterceptors(
    FileInterceptor('hinhAnh', {
      storage: imageStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @Body() dto: CreateSanBaiDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<SanBai>> {
    const hinhAnhPath = file ? `/uploads/san-bai/${file.filename}` : undefined;
    const data = await this.sanBaiService.create(dto, hinhAnhPath);
    return successResponse(data, 'Thêm sân bãi thành công');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin sân bãi' })
  @ApiParam({ name: 'id', description: 'Mã sân', type: Number })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tenSan: { type: 'string', description: 'Tên sân' },
        maLoaiSan: { type: 'number', description: 'Mã loại sân' },
        giaThue: { type: 'number', description: 'Giá thuê mỗi khung giờ' },
        viTri: { type: 'string', description: 'Vị trí sân' },
        trangThai: {
          type: 'string',
          enum: ['Hoạt động', 'Bảo trì', 'Không hoạt động'],
        },
        hinhAnh: {
          type: 'string',
          format: 'binary',
          description: 'File hình ảnh',
        },
      },
    },
  })
  @SwaggerResponse({ status: 200, description: 'Cập nhật sân thành công' })
  @SwaggerResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy sân' })
  @UseInterceptors(
    FileInterceptor('hinhAnh', {
      storage: imageStorage,
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSanBaiDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<SanBai>> {
    const hinhAnhPath = file ? `/uploads/san-bai/${file.filename}` : undefined;
    const data = await this.sanBaiService.update(id, dto, hinhAnhPath);
    return successResponse(data, 'Cập nhật sân bãi thành công');
  }

  @Patch(':id/trang-thai')
  @ApiOperation({
    summary: 'Cập nhật trạng thái sân (Hoạt động/Bảo trì/Không hoạt động)',
  })
  @ApiParam({ name: 'id', description: 'Mã sân', type: Number })
  @SwaggerResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy sân' })
  async updateTrangThai(
    @Param('id', ParseIntPipe) id: number,
    @Body('trangThai') trangThai: string,
  ): Promise<ApiResponse<SanBai>> {
    const data = await this.sanBaiService.updateTrangThai(id, trangThai);
    return successResponse(data, 'Cập nhật trạng thái sân thành công');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa sân bãi' })
  @ApiParam({ name: 'id', description: 'Mã sân', type: Number })
  @SwaggerResponse({ status: 200, description: 'Xóa sân thành công' })
  @SwaggerResponse({
    status: 400,
    description: 'Không thể xóa sân đang có lịch đặt',
  })
  @SwaggerResponse({ status: 404, description: 'Không tìm thấy sân' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiResponse<null>> {
    await this.sanBaiService.remove(id);
    return successResponse(null, 'Xóa sân bãi thành công');
  }
}