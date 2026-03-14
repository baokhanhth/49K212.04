// import {
//   IsNotEmpty,
//   IsInt,
//   IsDateString,
//   IsArray,
//   ArrayNotEmpty,
//   IsBoolean,
//   IsOptional,
//   IsString,
//   MaxLength,
// } from 'class-validator';
// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// export class KhoaLichSanDto {
//   @ApiProperty({ description: 'Mã sân', example: 1 })
//   @IsNotEmpty({ message: 'Mã sân không được để trống' })
//   @IsInt({ message: 'Mã sân phải là số nguyên' })
//   maSan!: number;

//   @ApiProperty({
//     description: 'Ngày áp dụng (YYYY-MM-DD)',
//     example: '2026-03-07',
//   })
//   @IsNotEmpty({ message: 'Ngày áp dụng không được để trống' })
//   @IsDateString(
//     {},
//     { message: 'Ngày áp dụng phải có định dạng YYYY-MM-DD' },
//   )
//   ngayApDung!: string;

//   @ApiProperty({
//     description: 'Danh sách mã khung giờ cần khoá/mở khoá',
//     example: [1, 2, 3],
//     type: [Number],
//   })
//   @IsArray({ message: 'Danh sách khung giờ phải là mảng' })
//   @ArrayNotEmpty({ message: 'Danh sách khung giờ không được rỗng' })
//   @IsInt({ each: true, message: 'Mã khung giờ phải là số nguyên' })
//   danhSachKhungGio!: number[];

//   @ApiProperty({
//     description: 'true = khoá (sinh viên không đặt được), false = mở khoá',
//     example: true,
//   })
//   @IsNotEmpty({ message: 'Trạng thái khoá không được để trống' })
//   @IsBoolean({ message: 'khoa phải là boolean' })
//   khoa!: boolean;

//   @ApiPropertyOptional({
//     description: 'Lý do khoá lịch (chỉ cần khi khoá)',
//     example: 'Trường có sự kiện chiều thứ 7',
//   })
//   @IsOptional()
//   @IsString({ message: 'Lý do khoá phải là chuỗi' })
//   @MaxLength(500, { message: 'Lý do khoá tối đa 500 ký tự' })
//   lyDoKhoa?: string;
// }


import {
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class KhoaLichSanDto {

  @ApiProperty({ description: 'Mã sân', example: 1 })
  @IsNotEmpty({ message: 'Mã sân không được để trống' })
  @IsInt({ message: 'Mã sân phải là số nguyên' })
  maSan!: number;

  @ApiProperty({
    description: 'Ngày áp dụng (YYYY-MM-DD)',
    example: '2026-03-07',
  })
  @IsNotEmpty({ message: 'Ngày áp dụng không được để trống' })
  @IsDateString({}, { message: 'Ngày áp dụng phải có định dạng YYYY-MM-DD' })
  ngayApDung!: string;

  @ApiProperty({
    description: 'Giờ bắt đầu',
    example: '08:00:00',
  })
  @IsNotEmpty({ message: 'Giờ bắt đầu không được để trống' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'Giờ bắt đầu phải có định dạng HH:mm:ss',
  })
  gioBatDau!: string;

  @ApiProperty({
    description: 'Giờ kết thúc',
    example: '10:00:00',
  })
  @IsNotEmpty({ message: 'Giờ kết thúc không được để trống' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'Giờ kết thúc phải có định dạng HH:mm:ss',
  })
  gioKetThuc!: string;

  @ApiProperty({
    description: 'true = khoá lịch (đóng), false = mở lịch',
    example: true,
  })
  @IsNotEmpty({ message: 'Trạng thái khoá không được để trống' })
  @IsBoolean({ message: 'khoa phải là boolean' })
  khoa!: boolean;

  @ApiPropertyOptional({
    description: 'Lý do khoá lịch',
    example: 'Trường có sự kiện',
  })
  @IsOptional()
  @IsString({ message: 'Lý do khoá phải là chuỗi' })
  @MaxLength(500, { message: 'Lý do khoá tối đa 500 ký tự' })
  lyDoKhoa?: string;
}