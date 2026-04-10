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
   * KPI tong hop — doanh thu, don hang, khach moi, ton kho thap
   */
  async getKpis() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Doanh thu hom nay
    const revenueToday = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.salOrderTotal), 0)', 'value')
      .where('o.salOrderStatus = 4')
      .andWhere('o.createdDate >= :today', { today })
      .getRawOne();

    // Doanh thu thang
    const revenueMonth = await this.orderRepo
      .createQueryBuilder('o')
      .select('COALESCE(SUM(o.salOrderTotal), 0)', 'value')
      .where('o.salOrderStatus = 4')
      .andWhere('o.createdDate >= :month', { month: firstDayOfMonth })
      .getRawOne();

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

    // Khach hang moi thang nay
    const newCustomers = await this.customerRepo
      .createQueryBuilder('c')
      .leftJoin('c.user', 'u')
      .where('u.createdDate >= :month', { month: firstDayOfMonth })
      .getCount();

    // Ton kho thap (< 10)
    const lowStock = await this.inventoryRepo
      .createQueryBuilder('il')
      .where('il.invInventoryLevelAvailable < 10')
      .andWhere('il.invInventoryLevelAvailable > 0')
      .getCount();

    return {
      revenue_today: { value: Number(revenueToday?.value || 0) },
      revenue_month: { value: Number(revenueMonth?.value || 0) },
      orders_count: {
        value: totalOrders,
        pending: ordersByStatus[0] || 0,
        shipping: ordersByStatus[3] || 0,
        completed: ordersByStatus[4] || 0,
      },
      new_customers: { value: newCustomers },
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
}
