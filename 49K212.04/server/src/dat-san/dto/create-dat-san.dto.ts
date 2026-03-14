import { IsNumber } from "class-validator";

export class CreateDatSanDto {

  @IsNumber()
  userId: number;

  @IsNumber()
  maLichSan: number;

}