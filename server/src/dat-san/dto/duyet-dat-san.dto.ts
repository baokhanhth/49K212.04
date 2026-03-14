import { IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DuyetDatSanDto {
  @ApiProperty({
    description: 'Trạng thái duyệt',
    example: 'Đã duyệt',
    enum: ['Đã duyệt', 'Từ chối'],
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsIn(['Đã duyệt', 'Từ chối'], { message: "Trạng thái phải là 'Đã duyệt' hoặc 'Từ chối'" })
  trangThai: string;
}
