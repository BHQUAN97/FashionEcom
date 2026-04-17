import { IsEmail, IsString, MinLength, IsOptional, IsInt, Min, Max, Matches } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'Mat khau phai co it nhat 1 chu hoa va 1 so',
  })
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(1)
  @Max(6)
  role!: number;
}
