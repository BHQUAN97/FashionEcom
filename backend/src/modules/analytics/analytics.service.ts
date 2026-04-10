import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsEventEntity } from './entities/analytics-event.entity';
import { BatchEventsDto } from './dto/batch-events.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEventEntity)
    private readonly eventRepo: Repository<AnalyticsEventEntity>,
  ) {}

  /**
   * Batch insert events tu FE — gom nhieu events 1 request de giam load
   */
  async batchInsert(dto: BatchEventsDto): Promise<{ inserted: number }> {
    const entities = dto.events.map((ev) => {
      const entity = new AnalyticsEventEntity();
      entity.logAnalyticsEventType = ev.type;
      entity.logAnalyticsEventData = ev.data || null;
      entity.logAnalyticsEventSessionId = ev.session_id;
      entity.sysCustomerId = ev.customer_id || null;
      entity.logAnalyticsEventDevice = ev.device || null;
      entity.logAnalyticsEventSource = ev.source || null;
      if (ev.timestamp) {
        entity.createdDate = new Date(ev.timestamp);
      }
      return entity;
    });

    // Batch insert cho performance
    const chunkSize = 100;
    let inserted = 0;
    for (let i = 0; i < entities.length; i += chunkSize) {
      const chunk = entities.slice(i, i + chunkSize);
      await this.eventRepo.insert(chunk as unknown as Record<string, unknown>[]);
      inserted += chunk.length;
    }

    return { inserted };
  }
}
