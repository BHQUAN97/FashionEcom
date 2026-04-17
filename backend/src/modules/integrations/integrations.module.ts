import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationsController } from './integrations.controller';
import { SyncEngineService } from './services/sync-engine.service';
import { FileParserService } from './services/file-parser.service';
import { GoogleSheetsService } from './services/google-sheets.service';
import { DataMapperService } from './services/data-mapper.service';
import { ImportJobEntity } from './entities/import-job.entity';
import { SyncConfigEntity } from './entities/sync-config.entity';

/**
 * IntegrationsModule — import/sync data tu file CSV/Excel va Google Sheets
 * Bao gom: file parser, Google Sheets API, data mapper, sync engine + cron
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([ImportJobEntity, SyncConfigEntity]),
  ],
  controllers: [IntegrationsController],
  providers: [
    SyncEngineService,
    FileParserService,
    GoogleSheetsService,
    DataMapperService,
  ],
  exports: [SyncEngineService],
})
export class IntegrationsModule {}
