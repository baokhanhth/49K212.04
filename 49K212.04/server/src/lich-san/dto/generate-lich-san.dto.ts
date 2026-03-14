// import {
//   IsNotEmpty,
//   IsInt,
//   IsDateString,
//   IsArray,
//   ArrayNotEmpty,
// } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// export class GenerateLichSanDto {
//   @ApiProperty({ description: 'Mã sân', example: 1 })
//   @IsNotEmpty({ message: 'Mã sân không được để trống' })
//   @IsInt({ message: 'Mã sân phải là số nguyên' })
//   maSan: number;

//   @ApiProperty({ description: 'Ngày bắt đầu (YYYY-MM-DD)', example: '2026-03-10' })
//   @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
//   @IsDateString({}, { message: 'Ngày bắt đầu phải có định dạng YYYY-MM-DD' })
//   tuNgay: string;

//   @ApiProperty({ description: 'Ngày kết thúc (YYYY-MM-DD)', example: '2026-03-20' })
//   @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
//   @IsDateString({}, { message: 'Ngày kết thúc phải có định dạng YYYY-MM-DD' })
//   denNgay: string;

//   @ApiProperty({
//     description: 'Danh sách mã khung giờ',
//     example: [1, 2, 3],
//     type: [Number],
//   })
//   @IsArray({ message: 'Danh sách khung giờ phải là mảng' })
//   @ArrayNotEmpty({ message: 'Danh sách khung giờ không được rỗng' })
//   @IsInt({ each: true, message: 'Mã khung giờ phải là số nguyên' })
//   danhSachKhungGio: number[];
// }
import {
  IsNotEmpty,
  IsInt,
  IsDateString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateLichSanDto {

  @ApiProperty({ description: 'Mã sân', example: 1 })
  @IsNotEmpty({ message: 'Mã sân không được để trống' })
  @IsInt({ message: 'Mã sân phải là số nguyên' })
  maSan: number;

  @ApiProperty({
    description: 'Ngày bắt đầu (YYYY-MM-DD)',
    example: '2026-03-10',
  })
  @IsNotEmpty({ message: 'Ngày bắt đầu không được để trống' })
  @IsDateString({}, { message: 'Ngày bắt đầu phải có định dạng YYYY-MM-DD' })
  tuNgay: string;

  @ApiProperty({
    description: 'Ngày kết thúc (YYYY-MM-DD)',
    example: '2026-03-20',
  })
  @IsNotEmpty({ message: 'Ngày kết thúc không được để trống' })
  @IsDateString({}, { message: 'Ngày kết thúc phải có định dạng YYYY-MM-DD' })
  denNgay: string;

  @ApiProperty({
    description: 'Giờ bắt đầu',
    example: '08:00:00',
  })
  @IsNotEmpty({ message: 'Giờ bắt đầu không được để trống' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'Giờ bắt đầu phải có định dạng HH:mm:ss',
  })
  gioBatDau: string;

  @ApiProperty({
    description: 'Giờ kết thúc',
    example: '10:00:00',
  })
  @IsNotEmpty({ message: 'Giờ kết thúc không được để trống' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'Giờ kết thúc phải có định dạng HH:mm:ss',
  })
  gioKetThuc: string;
}