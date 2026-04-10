import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../orders/entities/order.entity';
import { CustomerEntity } from '../customers/entities/customer.entity';
import { InventoryLevelEntity } from '../inventory/entities/inventory-level.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    @InjectRepository(InventoryLevelEntity)
    private readonly inventoryRepo: Repository<InventoryLevelEntity>,
  ) {}

  /**
   * KPI tong hop — doanh thu, don hang, khach moi, AOV, ton kho thap
   * Nang cap Phase 3: them % change so voi ky truoc
   */
  async getKpis() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Doanh thu hom nay vs hom qua
    const [revenueToday, revenueYesterday] = await Promise.all([
      this.getRevenueForDateRange(today, new Date()),
      this.getRevenueForDateRange(yesterday, today),
    ]);

    // Doanh thu thang nay vs thang truoc
    const [revenueMonth, revenuePrevMonth] = await Promise.all([
      this.getRevenueForDateRange(firstDayOfMonth, new Date()),
      this.getRevenueForDateRange(firstDayPrevMonth, lastDayPrevMonth),
    ]);

    // Don hang thang nay vs thang truoc
    const [ordersMonth, ordersPrevMonth] = await Promise.all([
      this.getOrderCountForDateRange(firstDayOfMonth, new Date()),
      this.getOrderCountForDateRange(firstDayPrevMonth, lastDayPrevMonth),
    ]);

    // Don hang theo trang thai
    const ordersStats = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.salOrderStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.salOrderStatus')
      .getRawMany();

    const ordersByStatus = Object.fromEntries(
      ordersStats.map((r) => [r.status, Number(r.count)]),
    );
    const totalOrders = ordersStats.reduce((sum, r) => sum + Number(r.count), 0);

    // Khach hang moi thang nay vs thang truoc
    const [newCustomers, prevCustomers] = await Promise.all([
      this.getNewCustomerCount(firstDayOfMonth, new Date()),
      this.getNewCustomerCount(firstDayPrevMonth, lastDayPrevMonth),
    ]);

    // AOV (Gia tri don trung binh)
    const aovMonth = ordersMonth > 0 ? revenueMonth / ordersMonth : 0;
    const aovPrev = ordersPrevMonth > 0 ? revenuePrevMonth / ordersPrevMonth : 0;

    // Ton kho canh bao
    const lowStock = await this.inventoryRepo
      .createQueryBuilder('il')
      .where('il.invInventoryLevelAvailable < 10')
      .andWhere('il.invInventoryLevelAvailable > 0')
      .getCount();

    return {
      revenue_today: {
        value: revenueToday,
        change: this.calcChange(revenueToday, revenueYesterday),
      },
      revenue_month: {
        value: revenueMonth,
        change: this.calcChange(revenueMonth, revenuePrevMonth),
      },
      orders_count: {
        value: totalOrders,
        month: ordersMonth,
        change: this.calcChange(ordersMonth, ordersPrevMonth),
        pending: ordersByStatus[0] || 0,
        shipping: ordersByStatus[3] || 0,
        completed: ordersByStatus[4] || 0,
      },
      new_customers: {
        value: newCustomers,
        change: this.calcChange(newCustomers, prevCustomers),
      },
      aov: {
        value: Math.round(aovMonth),
        change: this.calcChange(aovMonth, aovPrev),
      },
      low_stock_alerts: { value: lowStock },
    };
  }

  /**
   * Bieu do doanh thu theo ngay
   */
  async getRevenueChart(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.orderRepo
      .createQueryBuilder('o')
      .select('DATE(o.createdDate)', 'date')
      .addSelect('COALESCE(SUM(o.salOrderTotal), 0)', 'revenue')
      .addSelect('COUNT(*)', 'orders_count')
      .where('o.salOrderStatus = 4')
      .andWhere('o.createdDate >= :since', { since })
      .groupBy('DATE(o.createdDate)')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  /**
   * Bieu do don hang theo trang thai
   */
  async getOrdersByStatus() {
    return this.orderRepo
      .createQueryBuilder('o')
      .select('o.salOrderStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.salOrderStatus')
      .getRawMany();
  }

  /**
   * Bieu do phuong thuc thanh toan
   */
  async getPaymentMethods(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.orderRepo
      .createQueryBuilder('o')
      .select('o.salOrderPaymentType', 'method')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(o.salOrderTotal), 0)', 'total')
      .where('o.createdDate >= :since', { since })
      .groupBy('o.salOrderPaymentType')
      .getRawMany();
  }

  /**
   * Top san pham ban chay
   */
  async getTopProducts(days: number, topN: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('sal_order_item', 'oi', 'oi.sal_order_id = o.salOrderId')
      .innerJoin('cat_product_variant', 'v', 'v.cat_product_variant_id = oi.catProductVariantId')
      .innerJoin('cat_product', 'p', 'p.cat_product_id = v.catProductId')
      .select('p.cat_product_name', 'product_name')
      .addSelect('p.cat_product_code', 'sku')
      .addSelect('COALESCE(SUM(oi.sal_order_item_qty), 0)', 'qty_sold')
      .addSelect('COALESCE(SUM(oi.sal_order_item_price * oi.sal_order_item_qty), 0)', 'revenue')
      .where('o.salOrderStatus = 4')
      .andWhere('o.createdDate >= :since', { since })
      .groupBy('p.cat_product_id')
      .orderBy('qty_sold', 'DESC')
      .limit(topN)
      .getRawMany();
  }

  /**
   * Phase 3: Top danh muc ban chay
   */
  async getTopCategories(days: number, topN: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('sal_order_item', 'oi', 'oi.sal_order_id = o.salOrderId')
      .innerJoin('cat_product_variant', 'v', 'v.cat_product_variant_id = oi.catProductVariantId')
      .innerJoin('cat_product', 'p', 'p.cat_product_id = v.catProductId')
      .innerJoin('cat_category', 'c', 'c.cat_category_id = p.catCategoryId')
      .select('c.cat_category_name', 'category_name')
      .addSelect('COALESCE(SUM(oi.sal_order_item_qty), 0)', 'qty_sold')
      .addSelect('COALESCE(SUM(oi.sal_order_item_price * oi.sal_order_item_qty), 0)', 'revenue')
      .where('o.salOrderStatus = 4')
      .andWhere('o.createdDate >= :since', { since })
      .groupBy('c.cat_category_id')
      .orderBy('revenue', 'DESC')
      .limit(topN)
      .getRawMany();
  }

  /**
   * Phase 3: Heatmap don hang — grid 24h x 7 ngay trong tuan
   */
  async getOrderHeatmap(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.orderRepo
      .createQueryBuilder('o')
      .select('DAYOFWEEK(o.createdDate)', 'day_of_week')
      .addSelect('HOUR(o.createdDate)', 'hour_of_day')
      .addSelect('COUNT(*)', 'order_count')
      .where('o.salOrderStatus NOT IN (5)')
      .andWhere('o.createdDate >= :since', { since })
      .groupBy('DAYOFWEEK(o.createdDate)')
      .addGroupBy('HOUR(o.createdDate)')
      .getRawMany();
  }

  /**
   * Phase 3: Khach hang moi theo ngay (area chart)
   */
  async getNewCustomersChart(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.customerRepo
      .createQueryBuilder('c')
      .leftJoin('c.user', 'u')
      .select('DATE(u.createdDate)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('u.createdDate >= :since', { since })
      .groupBy('DATE(u.createdDate)')
      .orderBy('date', 'ASC')
      .getRawMany();
  }

  // === Helper methods ===

  private async getRevenueForDateRange(start: Date, end: Date): Promise<number> {
    const result = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.salOrderTotal), 0)', 'value')
      .where('o.salOrderStatus = 4')
      .andWhere('o.createdDate >= :start', { start })
      .andWhere('o.createdDate < :end', { end })
      .getRawOne();
    return Number(result?.value || 0);
  }

  private async getOrderCountForDateRange(start: Date, end: Date): Promise<number> {
    return this.orderRepo
      .createQueryBuilder('o')
      .where('o.salOrderStatus = 4')
      .andWhere('o.createdDate >= :start', { start })
      .andWhere('o.createdDate < :end', { end })
      .getCount();
  }

  private async getNewCustomerCount(start: Date, end: Date): Promise<number> {
    return this.customerRepo
      .createQueryBuilder('c')
      .leftJoin('c.user', 'u')
      .where('u.createdDate >= :start', { start })
      .andWhere('u.createdDate < :end', { end })
      .getCount();
  }

  /**
   * Tinh % thay doi giua 2 ky
   */
  private calcChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 10000) / 100;
  }
}
