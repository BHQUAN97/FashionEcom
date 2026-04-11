import {
  IsUUID, IsInt, Min, Max, IsString,
  IsOptional, IsArray, MaxLength, ArrayMaxSize,
} from 'class-validator';

/** DTO tao review — validate rating [1-5], gioi han noi dung + anh */
export class CreateReviewDto {
  @IsUUID()
  productId!: string;

  @IsUUID()
  orderItemId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  content?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  @IsOptional()
  photos?: string[];
}
