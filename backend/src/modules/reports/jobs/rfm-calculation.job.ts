import { Injectable, Logger } from '@nestjs/common';
import { RfmService } from '../services/rfm.service';

/**
 * Cron job: 01:00 daily — tinh RFM score cho tat ca khach hang
 * TRUNCATE + INSERT (full recalc)
 */
@Injectable()
export class RfmCalculationJob {
  private readonly logger = new Logger(RfmCalculationJob.name);

  constructor(private readonly rfmService: RfmService) {}

  async execute(): Promise<void> {
    this.logger.log('Bat dau tinh RFM...');
    const result = await this.rfmService.recalculate();
    this.logger.log(`RFM tinh xong: ${result.processed} khach hang`);
  }
}
