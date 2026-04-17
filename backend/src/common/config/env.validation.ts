import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsString,
  IsOptional,
  validateSync,
} from 'class-validator';

/**
 * Cac gia tri NODE_ENV hop le
 */
export enum NodeEnv {
  dev = 'development',
  prod = 'production',
  test = 'test',
}

/**
 * Schema validate bien moi truong (.env)
 * Moi lan app khoi dong, Nest se goi validateEnv() de dam bao env day du va dung kieu
 */
export class EnvSchema {
  @IsEnum(NodeEnv)
  NODE_ENV!: NodeEnv;

  @IsInt()
  PORT!: number;

  @IsString()
  DB_HOST!: string;

  @IsInt()
  DB_PORT!: number;

  @IsString()
  DB_USERNAME!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  DB_NAME!: string;

  @IsString()
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  @IsInt()
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;
}

/**
 * Validate bien moi truong khi app khoi dong
 * Throw Error neu thieu hoac sai kieu — app fail-fast tranh chay voi config sai
 */
export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvSchema, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length) {
    throw new Error(`Env validation failed: ${errors.toString()}`);
  }
  return validated;
}
