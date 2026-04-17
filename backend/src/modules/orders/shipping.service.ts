import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ShippingConfigEntity } from './entities/shipping-config.entity';
import { UpsertShippingConfigDto } from './dto/shipping.dto';

/**
 * Quan ly cau hinh phi van chuyen dong gia
 * + Tinh phi ship cho don hang (bao gom free ship logic)
 * + Bao cao free ship
 */
@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  constructor(
    @InjectRepository(ShippingConfigEntity)
    private readonly configRepo: Repository<ShippingConfigEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== CRUD Shipping Config ====================

  async findAll() {
    return this.configRepo.find({
      order: { salShippingConfigSortOrder: 'ASC', salShippingConfigName: 'ASC' },
    });
  }

  async findOne(id: string) {
    const config = await this.configRepo.findOne({ where: { salShippingConfigId: id } });
    if (!config) throw new NotFoundException('Cau hinh van chuyen khong ton tai');
    return config;
  }

  async findByProvider(provider: string) {
    return this.configRepo.findOne({
      where: { salShippingConfigProvider: provider.toUpperCase(), salShippingConfigStatus: 1 },
    });
  }

  async upsert(dto: UpsertShippingConfigDto) {
    const existing = await this.configRepo.findOne({
      where: { salShippingConfigProvider: dto.provider.toUpperCase() },
    });

    if (existing) {
      // Update
      existing.salShippingConfigName = dto.name;
      existing.salShippingConfigFlatRate = dto.flatRate;
      existing.salShippingConfigActualCost = dto.actualCost;
      existing.salShippingConfigFreeShipThreshold = dto.freeShipThreshold;
      existing.salShippingConfigStatus = dto.status ?? existing.salShippingConfigStatus;
      existing.salShippingConfigSortOrder = dto.sortOrder ?? existing.salShippingConfigSortOrder;

      this.logger.log(
        `[AUDIT] Update shipping config: provider=${dto.provider}, flatRate=${dto.flatRate}, actualCost=${dto.actualCost}`,
      );

      return this.configRepo.save(existing);
    }

    // Create
    const entity = this.configRepo.create({
      salShippingConfigId: randomUUID(),
      salShippingConfigProvider: dto.provider.toUpperCase(),
      salShippingConfigName: dto.name,
      salShippingConfigFlatRate: dto.flatRate,
      salShippingConfigActualCost: dto.actualCost,
      salShippingConfigFreeShipThreshold: dto.freeShipThreshold,
      salShippingConfigStatus: dto.status ?? 1,
      salShippingConfigSortOrder: dto.sortOrder ?? 0,
    });

    this.logger.log(
      `[AUDIT] Create shipping config: provider=${dto.provider}, flatRate=${dto.flatRate}, actualCost=${dto.actualCost}`,
    );

    return this.configRepo.save(entity);
  }

  async remove(id: string) {
    const config = await this.findOne(id);
    this.logger.warn(`[AUDIT] Delete shipping config: provider=${config.salShippingConfigProvider}`);
    return this.configRepo.remove(config);
  }

  // ==================== Tinh phi ship cho don hang ====================

  /**
   * Tinh phi ship dua tren provider va subtotal
   * Tra ve: shippingFee (thu KH), actualCost (tra DVVC), freeShip flag
   */
  calcShippingForOrder(
    config: ShippingConfigEntity,
    orderSubtotal: number,
  ): { shippingFee: number; actualCost: number; freeShip: boolean } {
    const threshold = Number(config.salShippingConfigFreeShipThreshold);
    const freeShip = threshold > 0 && orderSubtotal >= threshold;

    return {
      shippingFee: freeShip ? 0 : Number(config.salShippingConfigFlatRate),
      actualCost: Number(config.salShippingConfigActualCost),
      freeShip,
    };
  }

  // ==================== Bao cao free ship ====================

  /**
   * Bao cao tong quan free ship:
   * - So don free ship / tong don
   * - Tong chi phi ship thuc te phai ganh cho free ship
   * - Loi nhuan ship (don thu phi - don free ship)
   */
  async getFreeShipReport(from?: string, to?: string) {
    const params: unknown[] = [];
    let dateFilter = '';

    if (from) { dateFilter += ' AND o.created_date >= ?'; params.push(from); }
    if (to) { dateFilter += ' AND o.created_date <= ?'; params.push(to); }

    const sql = `
      SELECT
        COUNT(*) AS total_orders,
        SUM(CASE WHEN o.sal_order_free_ship = 1 THEN 1 ELSE 0 END) AS free_ship_orders,
        SUM(CASE WHEN o.sal_order_free_ship = 0 THEN 1 ELSE 0 END) AS paid_ship_orders,

        -- Thu phi ship tu KH (chi don tra phi)
        COALESCE(SUM(o.sal_order_shipping_fee), 0) AS total_shipping_revenue,

        -- Chi phi ship thuc te tra DVVC (tat ca don)
        COALESCE(SUM(o.sal_order_shipping_cost_actual), 0) AS total_shipping_cost,

        -- Chi phi ganh free ship = actual cost cua cac don free ship
        COALESCE(SUM(CASE WHEN o.sal_order_free_ship = 1 THEN o.sal_order_shipping_cost_actual ELSE 0 END), 0)
          AS free_ship_cost_absorbed,

        -- Loi nhuan ship = thu KH - tra DVVC
        COALESCE(SUM(o.sal_order_shipping_fee), 0) - COALESCE(SUM(o.sal_order_shipping_cost_actual), 0)
          AS shipping_profit,

        -- Trung binh gia tri don free ship
        COALESCE(AVG(CASE WHEN o.sal_order_free_ship = 1 THEN o.sal_order_subtotal ELSE NULL END), 0)
          AS avg_free_ship_order_value

      FROM sal_order o
      WHERE o.sal_order_status IN (1,2,3,4)
        ${dateFilter}
    `;

    const [result] = await this.dataSource.query(sql, params);

    // Breakdown theo don vi van chuyen
    const providerSql = `
      SELECT
        COALESCE(o.sal_order_shipping_provider, 'UNKNOWN') AS provider,
        COUNT(*) AS order_count,
        SUM(CASE WHEN o.sal_order_free_ship = 1 THEN 1 ELSE 0 END) AS free_count,
        COALESCE(SUM(o.sal_order_shipping_fee), 0) AS revenue,
        COALESCE(SUM(o.sal_order_shipping_cost_actual), 0) AS cost,
        COALESCE(SUM(o.sal_order_shipping_fee), 0) - COALESCE(SUM(o.sal_order_shipping_cost_actual), 0) AS profit
      FROM sal_order o
      WHERE o.sal_order_status IN (1,2,3,4)
        ${dateFilter}
      GROUP BY o.sal_order_shipping_provider
      ORDER BY order_count DESC
    `;

    const byProvider = await this.dataSource.query(providerSql, params);

    return {
      summary: {
        total_orders: Number(result.total_orders),
        free_ship_orders: Number(result.free_ship_orders),
        paid_ship_orders: Number(result.paid_ship_orders),
        free_ship_rate: result.total_orders > 0
          ? Math.round((Number(result.free_ship_orders) / Number(result.total_orders)) * 100 * 10) / 10
          : 0,
        total_shipping_revenue: Number(result.total_shipping_revenue),
        total_shipping_cost: Number(result.total_shipping_cost),
        free_ship_cost_absorbed: Number(result.free_ship_cost_absorbed),
        shipping_profit: Number(result.shipping_profit),
        avg_free_ship_order_value: Math.round(Number(result.avg_free_ship_order_value)),
      },
      by_provider: byProvider.map((r: Record<string, unknown>) => ({
        provider: r.provider,
        order_count: Number(r.order_count),
        free_count: Number(r.free_count),
        revenue: Number(r.revenue),
        cost: Number(r.cost),
        profit: Number(r.profit),
      })),
    };
  }

  /**
   * Loi nhuan chi tiet per don hang — bao gom ship profit
   */
  async getOrderProfitReport(from?: string, to?: string, page = 1, limit = 20) {
    const params: unknown[] = [];
    let dateFilter = '';

    if (from) { dateFilter += ' AND o.created_date >= ?'; params.push(from); }
    if (to) { dateFilter += ' AND o.created_date <= ?'; params.push(to); }

    const countSql = `
      SELECT COUNT(*) AS total FROM sal_order o
      WHERE o.sal_order_status IN (1,2,3,4) ${dateFilter}
    `;
    const [{ total }] = await this.dataSource.query(countSql, [...params]);

    const sql = `
      SELECT
        o.sal_order_id,
        o.sal_order_code,
        o.created_date,
        o.sal_order_subtotal,
        o.sal_order_discount,
        o.sal_order_shipping_fee,
        o.sal_order_shipping_cost_actual,
        o.sal_order_free_ship,
        o.sal_order_total,
        COALESCE(o.sal_order_shipping_provider, '') AS shipping_provider,
        o.sal_order_status,

        -- COGS
        COALESCE(items.total_cost, 0) AS cogs,

        -- Gross profit = (subtotal - discount) - COGS
        (o.sal_order_subtotal - o.sal_order_discount) - COALESCE(items.total_cost, 0) AS gross_profit,

        -- Ship profit = thu KH - tra DVVC
        o.sal_order_shipping_fee - o.sal_order_shipping_cost_actual AS ship_profit,

        -- Net profit = gross_profit + ship_profit
        (o.sal_order_subtotal - o.sal_order_discount) - COALESCE(items.total_cost, 0)
          + (o.sal_order_shipping_fee - o.sal_order_shipping_cost_actual) AS net_profit

      FROM sal_order o
      LEFT JOIN (
        SELECT sal_order_id,
               SUM(sal_order_item_qty * sal_order_item_cost) AS total_cost
        FROM sal_order_item
        GROUP BY sal_order_id
      ) items ON items.sal_order_id = o.sal_order_id
      WHERE o.sal_order_status IN (1,2,3,4) ${dateFilter}
      ORDER BY o.created_date DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, (page - 1) * limit);
    const data = await this.dataSource.query(sql, params);

    return {
      data: data.map((r: Record<string, unknown>) => ({
        orderId: r.sal_order_id,
        orderCode: r.sal_order_code,
        createdDate: r.created_date,
        subtotal: Number(r.sal_order_subtotal),
        discount: Number(r.sal_order_discount),
        shippingFee: Number(r.sal_order_shipping_fee),
        shippingCostActual: Number(r.sal_order_shipping_cost_actual),
        freeShip: Number(r.sal_order_free_ship) === 1,
        total: Number(r.sal_order_total),
        shippingProvider: r.shipping_provider,
        status: Number(r.sal_order_status),
        cogs: Number(r.cogs),
        grossProfit: Number(r.gross_profit),
        shipProfit: Number(r.ship_profit),
        netProfit: Number(r.net_profit),
      })),
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    };
  }
}
