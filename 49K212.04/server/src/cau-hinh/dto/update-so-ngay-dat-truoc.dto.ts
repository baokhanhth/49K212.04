import { IsNotEmpty, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSoNgayDatTruocDto {
  @ApiProperty({
    description: 'Số ngày tối đa cho phép đặt trước sân (1-90)',
    example: 7,
    minimum: 1,
    maximum: 90,
  })
  @IsNotEmpty({ message: 'Số ngày đặt trước không được để trống' })
  @IsInt({ message: 'Số ngày đặt trước phải là số nguyên' })
  @Min(1, { message: 'Số ngày đặt trước tối thiểu là 1' })
  @Max(90, { message: 'Số ngày đặt trước tối đa là 90' })
  soNgayDatTruoc!: number;
}
