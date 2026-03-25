import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class XacNhanOtpDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'OTP không được để trống' })
  @Length(6, 6, { message: 'OTP phải gồm đúng 6 ký tự' })
  otp: string;
}