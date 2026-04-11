import { Module } from '@nestjs/common';
import { SearchController, AdminSearchController } from './search.controller';
import { MeilisearchService } from './meilisearch.service';

@Module({
  controllers: [SearchController, AdminSearchController],
  providers: [MeilisearchService],
  exports: [MeilisearchService],
})
export class SearchModule {}
