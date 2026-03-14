import { IsNotEmpty, IsIn, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DuyetDatSanDto {
  @ApiProperty({
    description: 'Trạng thái duyệt',
    example: 'Đã duyệt',
    enum: ['Đã duyệt', 'Bị từ chối'],
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsIn(['Đã duyệt', 'Bị từ chối'], { message: "Trạng thái phải là 'Đã duyệt' hoặc 'Bị từ chối'" })
  trangThai: string;

  @ApiProperty({ description: 'Mã người duyệt', example: 1 })
  @IsNotEmpty({ message: 'Mã người duyệt không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'Mã người duyệt phải là số nguyên' })
  nguoiDuyet: number;
}
