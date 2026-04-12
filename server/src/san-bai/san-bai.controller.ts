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

// Fix: handled merge conflict cleanup (Phuc)  ✅ thêm dòng này

// Cấu hình multer cho upload hình ảnh
const imageStorage = diskStorage({
  destination: './uploads/san-bai',
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `san-${uniqueSuffix}${ext}`);
  },
});