// import { IsOptional, IsInt, IsDateString } from 'class-validator';
// import { Type } from 'class-transformer';
// import { ApiPropertyOptional } from '@nestjs/swagger';

// export class QueryLichSanDto {
//   @ApiPropertyOptional({ description: 'Lọc theo mã sân', example: 1 })
//   @IsOptional()
//   @Type(() => Number)
//   @IsInt()
//   maSan?: number;

//   @ApiPropertyOptional({ description: 'Ngày bắt đầu lọc (YYYY-MM-DD)', example: '2026-03-10' })
//   @IsOptional()
//   @IsDateString()
//   tuNgay?: string;

//   @ApiPropertyOptional({ description: 'Ngày kết thúc lọc (YYYY-MM-DD)', example: '2026-03-20' })
//   @IsOptional()
//   @IsDateString()
//   denNgay?: string;

//   @ApiPropertyOptional({ description: 'Lọc theo mã khung giờ', example: 1 })
//   @IsOptional()
//   @Type(() => Number)
//   @IsInt()
//   maKhungGio?: number;

//   @ApiPropertyOptional({
//     description: 'Lọc trạng thái: "trong" = chỉ lịch trống, "da_dat" = chỉ lịch đã đặt, bỏ trống = tất cả',
//     enum: ['trong', 'da_dat'],
//     example: 'trong',
//   })
//   @IsOptional()
//   trangThai?: string;
// }
import {
  IsOptional,
  IsInt,
  IsDateString,
  IsString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryLichSanDto {
  @ApiPropertyOptional({ description: 'Lọc theo mã sân', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Mã sân phải là số nguyên' })
  maSan?: number;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu lọc (YYYY-MM-DD)',
    example: '2026-03-10',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày bắt đầu phải có định dạng YYYY-MM-DD' })
  tuNgay?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc lọc (YYYY-MM-DD)',
    example: '2026-03-20',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc phải có định dạng YYYY-MM-DD' })
  denNgay?: string;

  @ApiPropertyOptional({
    description: 'Giờ bắt đầu lọc',
    example: '08:00:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'Giờ bắt đầu phải có định dạng HH:mm:ss',
  })
  gioBatDau?: string;

  @ApiPropertyOptional({
    description: 'Giờ kết thúc lọc',
    example: '10:00:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'Giờ kết thúc phải có định dạng HH:mm:ss',
  })
  gioKetThuc?: string;

  @ApiPropertyOptional({
    description:
      'Lọc trạng thái: "trong" = lịch chưa có người đặt, "da_dat" = lịch đã đặt',
    enum: ['trong', 'da_dat'],
    example: 'trong',
  })
  @IsOptional()
  @IsString()
  trangThai?: string;
}