import {
  Controller, Get, Post, Put, Query, Body, UseGuards,
} from '@nestjs/common';
import { MeilisearchService } from './meilisearch.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

/** Public search endpoints */
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: MeilisearchService) {}

  @Get()
  async search(
    @Query('q') q: string,
    @Query('filters') filters?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.searchService.search(q || '', {
      filters,
      sort: sort ? sort.split(',') : undefined,
      page: page || 1,
      limit: limit || 20,
    });
    return { data };
  }

  @Get('suggestions')
  async suggestions(@Query('q') q: string) {
    const data = await this.searchService.suggest(q || '', 5);
    return { data };
  }
}

/** Admin search management */
@Controller('admin/search')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminSearchController {
  constructor(private readonly searchService: MeilisearchService) {}

  @Get('synonyms')
  async getSynonyms() {
    const data = await this.searchService.getSynonyms();
    return { data };
  }

  @Put('synonyms')
  async updateSynonyms(@Body() synonyms: Record<string, string[]>) {
    await this.searchService.updateSynonyms(synonyms);
    return { message: 'Cap nhat synonyms thanh cong' };
  }

  @Post('reindex')
  async reindex() {
    const data = await this.searchService.reindex();
    return { data };
  }

  @Get('stats')
  async stats() {
    return {
      data: {
        available: this.searchService.isAvailable(),
        indexName: 'products',
      },
    };
  }
}
