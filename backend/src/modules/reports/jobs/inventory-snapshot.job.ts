import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Cron job: 00:05 daily — chot ton kho tu inv_inventory_level vao log_inventory_snapshot
 * Dung de tinh gia tri ton kho trung binh cho turnover rate
 */
@Injectable()
export class InventorySnapshotJob {
  private readonly logger = new Logger(InventorySnapshotJob.name);

  constructor(private readonly dataSource: DataSource) {}

  async execute(): Promise<void> {
    this.logger.log('Bat dau chot ton kho daily...');

    const sql = `
      INSERT INTO log_inventory_snapshot
        (log_inventory_snapshot_id, cat_product_variant_id, inv_warehouse_id,
         log_inventory_snapshot_available, log_inventory_snapshot_cost, snapshot_date)
      SELECT
        UUID(),
        il.cat_product_variant_id,
        il.inv_warehouse_id,
        il.inv_inventory_level_available,
        v.cat_product_variant_cost,
        CURDATE()
      FROM inv_inventory_level il
      JOIN cat_product_variant v ON v.cat_product_variant_id = il.cat_product_variant_id
      ON DUPLICATE KEY UPDATE
        log_inventory_snapshot_available = il.inv_inventory_level_available,
        log_inventory_snapshot_cost = v.cat_product_variant_cost
    `;

    const result = await this.dataSource.query(sql);
    this.logger.log(`Chot ton kho xong: ${result.affectedRows || 0} rows`);
  }
}
