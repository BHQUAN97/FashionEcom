import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateEmailTemplateDto {
  @IsString()
  subject!: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsArray()
  variables?: Array<{ key: string; label: string; sample: string }>;
}
