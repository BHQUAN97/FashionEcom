import { IsInt, IsIn } from 'class-validator';

/** DTO cap nhat trang thai review: 0=cho duyet, 1=approved, 2=rejected */
export class UpdateReviewStatusDto {
  @IsInt()
  @IsIn([0, 1, 2])
  status!: number;
}
