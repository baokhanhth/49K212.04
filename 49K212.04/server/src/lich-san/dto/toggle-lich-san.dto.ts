// import {
//   IsNotEmpty,
//   IsInt,
//   IsDateString,
//   IsArray,
//   ArrayNotEmpty,
//   IsBoolean,
// } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

// export class ToggleLichSanDto {
//   @ApiProperty({ description: 'Mã sân', example: 1 })
//   @IsNotEmpty({ message: 'Mã sân không được để trống' })
//   @IsInt({ message: 'Mã sân phải là số nguyên' })
//   maSan: number;

//   @ApiProperty({ description: 'Ngày áp dụng (YYYY-MM-DD)', example: '2026-03-25' })
//   @IsNotEmpty({ message: 'Ngày áp dụng không được để trống' })
//   @IsDateString({}, { message: 'Ngày áp dụng phải có định dạng YYYY-MM-DD' })
//   ngayApDung: string;

//   @ApiProperty({
//     description: 'Danh sách mã khung giờ cần đóng/mở',
//     example: [1, 2, 3],
//     type: [Number],
//   })
//   @IsArray({ message: 'Danh sách khung giờ phải là mảng' })
//   @ArrayNotEmpty({ message: 'Danh sách khung giờ không được rỗng' })
//   @IsInt({ each: true, message: 'Mã khung giờ phải là số nguyên' })
//   danhSachKhungGio: number[];

//   @ApiProperty({
//     description: 'true = mở (tạo lịch sân), false = đóng (xóa lịch sân chưa đặt)',
//     example: true,
//   })
//   @IsNotEmpty({ message: 'Trạng thái mở/đóng không được để trống' })
//   @IsBoolean({ message: 'moLich phải là boolean' })
//   moLich: boolean;
// }

  import {
    IsNotEmpty,
    IsInt,
    IsDateString,
    IsBoolean,
    Matches,
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';
  
  export class ToggleLichSanDto {
    @ApiProperty({ description: 'Mã sân', example: 1 })
    @IsNotEmpty({ message: 'Mã sân không được để trống' })
    @IsInt({ message: 'Mã sân phải là số nguyên' })
    maSan: number;
  
    @ApiProperty({
      description: 'Ngày áp dụng (YYYY-MM-DD)',
      example: '2026-03-25',
    })
    @IsNotEmpty({ message: 'Ngày áp dụng không được để trống' })
    @IsDateString({}, { message: 'Ngày áp dụng phải có định dạng YYYY-MM-DD' })
    ngayApDung: string;
  
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
  
    @ApiProperty({
      description: 'true = tạo slot lịch, false = xóa slot lịch',
      example: true,
    })
    @IsNotEmpty({ message: 'Trạng thái không được để trống' })
    @IsBoolean({ message: 'moLich phải là boolean' })
    moLich: boolean;
  }