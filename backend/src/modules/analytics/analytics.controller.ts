import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { BatchEventsDto } from './dto/batch-events.dto';

/**
 * POST /api/analytics/events — batch event ingestion
 * KHONG can auth (guest cung track duoc)
 * Rate limit: 100 events/minute/IP (handle o middleware/guard level)
 */
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  @HttpCode(200)
  async batchEvents(@Body() dto: BatchEventsDto) {
    const result = await this.analyticsService.batchInsert(dto);
    return { success: true, data: result };
  }
}
