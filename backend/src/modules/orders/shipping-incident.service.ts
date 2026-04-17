import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ShippingIncidentEntity } from './entities/shipping-incident.entity';
import { OrderEntity } from './entities/order.entity';
import {
  CreateShippingIncidentDto,
  UpdateShippingIncidentDto,
  ShippingIncidentQueryDto,
} from './dto/shipping-incident.dto';

/** Labels loai su co */
const INCIDENT_TYPES: Record<number, string> = {
  1: 'Hư hỏng',
  2: 'Mất hàng',
  3: 'Khách từ chối nhận',
  4: 'Giao lại',
  5: 'Địa chỉ sai',
  6: 'Khác',
};

const INCIDENT_STATUS: Record<number, string> = {
  0: 'Mở',
  1: 'Đang xử lý',
  2: 'Đã xử lý',
  3: 'Đóng',
};

@Injectable()
export class ShippingIncidentService {
  private readonly logger = new Logger(ShippingIncidentService.name);

  constructor(
    @InjectRepository(ShippingIncidentEntity)
    private readonly incidentRepo: Repository<ShippingIncidentEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== CRUD ====================

  async create(dto: CreateShippingIncidentDto, userId: string) {
    const order = await this.orderRepo.findOne({ where: { salOrderId: dto.orderId } });
    if (!order) throw new NotFoundException('Don hang khong ton tai');

    // Auto-detect revenue impact theo type
    let revenueImpact = dto.revenueImpact ?? 0;
    if (dto.type === 1 || dto.type === 2) {
      // Hu hong / mat hang → mat doanh thu (default, admin co the override)
      revenueImpact = dto.revenueImpact ?? 1;
    }

    const incident = this.incidentRepo.create({
      salShippingIncidentId: randomUUID(),
      salOrderId: dto.orderId,
      salShippingIncidentType: dto.type,
      salShippingIncidentStatus: 0,
      salShippingIncidentDeliveryAttempts: dto.deliveryAttempts ?? 1,
      salShippingIncidentExtraCost: dto.extraCost ?? 0,
      salShippingIncidentProductLoss: dto.productLoss ?? 0,
      salShippingIncidentRefundAmount: dto.refundAmount ?? 0,
      salShippingIncidentCarrierCompensation: dto.carrierCompensation ?? 0,
      salShippingIncidentRevenueImpact: revenueImpact,
      salShippingIncidentNote: dto.note || null,
      salShippingIncidentPhotos: dto.photos || null,
      sysUserId: userId,
    });

    await this.incidentRepo.save(incident);

    // Cap nhat order: flag incident + sync delivery attempts + extra cost
    await this.syncOrderIncidentData(dto.orderId);

    // Auto-update shipping status theo loai su co
    const shippingStatusMap: Record<number, number> = {
      1: 10, // hu_hong → HuHong
      2: 9,  // mat_hang → MatHang
      3: 6,  // khach_tu_choi → GiaoThatBai
      4: 7,  // giao_lai → DangGiaoLai
      5: 6,  // dia_chi_sai → GiaoThatBai
    };
    const newShippingStatus = shippingStatusMap[dto.type];
    if (newShippingStatus !== undefined) {
      await this.orderRepo.update(dto.orderId, {
        salOrderShippingStatus: newShippingStatus,
      });
    }

    // Inventory impact: hoan hang → cong lai ton, mat/hu → giam ton (ghi note)
    if (dto.type === 3 || dto.type === 8) {
      // Khach tu choi / hoan hang → inventory se duoc xu ly khi nhan lai hang
      // (khong tu dong cong ton — phai qua nhap kho thu cong)
    }

    this.logger.warn(
      `[AUDIT] Shipping incident created: order=${order.salOrderCode}, type=${INCIDENT_TYPES[dto.type]}, ` +
      `extraCost=${dto.extraCost || 0}, productLoss=${dto.productLoss || 0}, by=${userId}`,
    );

    return incident;
  }

  async update(id: string, dto: UpdateShippingIncidentDto, userId: string) {
    const incident = await this.incidentRepo.findOne({
      where: { salShippingIncidentId: id },
    });
    if (!incident) throw new NotFoundException('Su co khong ton tai');

    if (dto.status !== undefined) incident.salShippingIncidentStatus = dto.status;
    if (dto.deliveryAttempts !== undefined) incident.salShippingIncidentDeliveryAttempts = dto.deliveryAttempts;
    if (dto.extraCost !== undefined) incident.salShippingIncidentExtraCost = dto.extraCost;
    if (dto.productLoss !== undefined) incident.salShippingIncidentProductLoss = dto.productLoss;
    if (dto.refundAmount !== undefined) incident.salShippingIncidentRefundAmount = dto.refundAmount;
    if (dto.carrierCompensation !== undefined) incident.salShippingIncidentCarrierCompensation = dto.carrierCompensation;
    if (dto.revenueImpact !== undefined) incident.salShippingIncidentRevenueImpact = dto.revenueImpact;
    if (dto.note !== undefined) incident.salShippingIncidentNote = dto.note;
    if (dto.photos !== undefined) incident.salShippingIncidentPhotos = dto.photos;

    // Resolved date
    if (dto.status === 2 || dto.status === 3) {
      incident.salShippingIncidentResolvedDate = new Date();
    }

    incident.sysUserId = userId;
    await this.incidentRepo.save(incident);

    // Sync order data
    await this.syncOrderIncidentData(incident.salOrderId);

    // Khi dong su co voi giao_lai thanh cong → set shipping = GiaoThanhCong
    if ((dto.status === 2 || dto.status === 3) && incident.salShippingIncidentType === 4) {
      // Giao lai resolved → co the da giao thanh cong
      // Admin tu quyet dinh set shipping status = 5 (GiaoThanhCong) rieng
    }

    // Khi set revenue_impact = 1 (mat DT) → order status = DaHuy
    if (dto.revenueImpact === 1) {
      const order = await this.orderRepo.findOne({ where: { salOrderId: incident.salOrderId } });
      if (order && order.salOrderStatus !== 5) {
        this.logger.warn(
          `[AUDIT] Revenue lost → mark order cancelled: order=${order.salOrderCode}`,
        );
      }
    }

    this.logger.log(`[AUDIT] Shipping incident updated: id=${id}, status=${dto.status}, by=${userId}`);

    return incident;
  }

  async findAll(query: ShippingIncidentQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.incidentRepo.createQueryBuilder('si')
      .leftJoinAndSelect('si.order', 'o');

    if (query.type !== undefined) {
      qb.andWhere('si.salShippingIncidentType = :t', { t: query.type });
    }
    if (query.status !== undefined) {
      qb.andWhere('si.salShippingIncidentStatus = :s', { s: query.status });
    }
    if (query.from) {
      qb.andWhere('si.createdDate >= :f', { f: query.from });
    }
    if (query.to) {
      qb.andWhere('si.createdDate <= :t2', { t2: query.to });
    }
    if (query.search) {
      qb.andWhere('o.salOrderCode LIKE :q', { q: `%${query.search}%` });
    }

    qb.orderBy('si.createdDate', 'DESC');

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    // Stats tong quan
    const statsSql = `
      SELECT
        sal_shipping_incident_type AS type,
        sal_shipping_incident_status AS status,
        COUNT(*) AS count
      FROM sal_shipping_incident
      GROUP BY sal_shipping_incident_type, sal_shipping_incident_status
    `;
    const statsRaw = await this.dataSource.query(statsSql);

    // Build stats summary
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const r of statsRaw) {
      const typeName = INCIDENT_TYPES[Number(r.type)] || 'Khac';
      const statusName = INCIDENT_STATUS[Number(r.status)] || 'Unknown';
      byType[typeName] = (byType[typeName] || 0) + Number(r.count);
      byStatus[statusName] = (byStatus[statusName] || 0) + Number(r.count);
    }

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: { byType, byStatus },
    };
  }

  async findOne(id: string) {
    const incident = await this.incidentRepo.findOne({
      where: { salShippingIncidentId: id },
      relations: ['order'],
    });
    if (!incident) throw new NotFoundException('Su co khong ton tai');
    return incident;
  }

  async findByOrder(orderId: string) {
    return this.incidentRepo.find({
      where: { salOrderId: orderId },
      order: { createdDate: 'DESC' },
    });
  }

  // ==================== Sync order aggregate data ====================

  /**
   * Dong bo du lieu su co len order header de query/report nhanh
   * Gom: max delivery_attempts, tong extra_cost, has_incident flag
   */
  private async syncOrderIncidentData(orderId: string) {
    const sql = `
      SELECT
        MAX(sal_shipping_incident_delivery_attempts) AS max_attempts,
        SUM(sal_shipping_incident_extra_cost) AS total_extra_cost,
        COUNT(*) AS incident_count
      FROM sal_shipping_incident
      WHERE sal_order_id = ?
    `;
    const [agg] = await this.dataSource.query(sql, [orderId]);

    await this.orderRepo.update(orderId, {
      salOrderDeliveryAttempts: Number(agg.max_attempts) || 1,
      salOrderShippingExtraCost: Number(agg.total_extra_cost) || 0,
      salOrderHasIncident: Number(agg.incident_count) > 0 ? 1 : 0,
    });
  }

  // ==================== Bao cao tong quan su co ====================

  /**
   * Dashboard su co van chuyen:
   * - Tong su co theo loai
   * - Tong thiet hai (mat hang + hu hong + phu phi)
   * - Impact len doanh thu
   * - DVVC boi thuong
   * - Breakdown theo DVVC
   */
  async getIncidentReport(from?: string, to?: string) {
    const params: unknown[] = [];
    let dateFilter = '';
    if (from) { dateFilter += ' AND si.created_date >= ?'; params.push(from); }
    if (to) { dateFilter += ' AND si.created_date <= ?'; params.push(to); }

    // Tong quan
    const summarySql = `
      SELECT
        COUNT(*) AS total_incidents,
        SUM(CASE WHEN si.sal_shipping_incident_status IN (0,1) THEN 1 ELSE 0 END) AS open_incidents,
        SUM(CASE WHEN si.sal_shipping_incident_status IN (2,3) THEN 1 ELSE 0 END) AS resolved_incidents,

        -- Chi phi
        COALESCE(SUM(si.sal_shipping_incident_extra_cost), 0) AS total_extra_cost,
        COALESCE(SUM(si.sal_shipping_incident_product_loss), 0) AS total_product_loss,
        COALESCE(SUM(si.sal_shipping_incident_refund_amount), 0) AS total_refund,
        COALESCE(SUM(si.sal_shipping_incident_carrier_compensation), 0) AS total_compensation,

        -- Thiet hai rong = extra_cost + product_loss + refund - compensation
        COALESCE(SUM(si.sal_shipping_incident_extra_cost), 0)
          + COALESCE(SUM(si.sal_shipping_incident_product_loss), 0)
          + COALESCE(SUM(si.sal_shipping_incident_refund_amount), 0)
          - COALESCE(SUM(si.sal_shipping_incident_carrier_compensation), 0) AS net_loss,

        -- Don mat doanh thu
        SUM(CASE WHEN si.sal_shipping_incident_revenue_impact = 1 THEN 1 ELSE 0 END) AS orders_lost_revenue,
        COALESCE(SUM(CASE WHEN si.sal_shipping_incident_revenue_impact = 1 THEN o.sal_order_subtotal ELSE 0 END), 0)
          AS lost_revenue_amount

      FROM sal_shipping_incident si
      JOIN sal_order o ON o.sal_order_id = si.sal_order_id
      WHERE 1=1 ${dateFilter}
    `;
    const [summary] = await this.dataSource.query(summarySql, params);

    // Breakdown theo loai su co
    const byTypeSql = `
      SELECT
        si.sal_shipping_incident_type AS type,
        COUNT(*) AS count,
        COALESCE(SUM(si.sal_shipping_incident_extra_cost), 0) AS extra_cost,
        COALESCE(SUM(si.sal_shipping_incident_product_loss), 0) AS product_loss,
        COALESCE(SUM(si.sal_shipping_incident_refund_amount), 0) AS refund
      FROM sal_shipping_incident si
      WHERE 1=1 ${dateFilter}
      GROUP BY si.sal_shipping_incident_type
      ORDER BY count DESC
    `;
    const byType = await this.dataSource.query(byTypeSql, params);

    // Breakdown theo DVVC
    const byProviderSql = `
      SELECT
        COALESCE(o.sal_order_shipping_provider, 'UNKNOWN') AS provider,
        COUNT(*) AS incident_count,
        COUNT(DISTINCT si.sal_order_id) AS order_count,
        COALESCE(SUM(si.sal_shipping_incident_extra_cost), 0) AS extra_cost,
        COALESCE(SUM(si.sal_shipping_incident_product_loss), 0) AS product_loss,
        -- Ti le su co = don co su co / tong don DVVC do
        COUNT(DISTINCT si.sal_order_id) * 100.0 / GREATEST(
          (SELECT COUNT(*) FROM sal_order o2 WHERE o2.sal_order_shipping_provider = o.sal_order_shipping_provider), 1
        ) AS incident_rate
      FROM sal_shipping_incident si
      JOIN sal_order o ON o.sal_order_id = si.sal_order_id
      WHERE 1=1 ${dateFilter}
      GROUP BY o.sal_order_shipping_provider
      ORDER BY incident_count DESC
    `;
    const byProvider = await this.dataSource.query(byProviderSql, params);

    // Trend 30 ngay
    const trendSql = `
      SELECT
        DATE(si.created_date) AS date,
        COUNT(*) AS count,
        COALESCE(SUM(si.sal_shipping_incident_extra_cost + si.sal_shipping_incident_product_loss), 0) AS loss
      FROM sal_shipping_incident si
      WHERE si.created_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(si.created_date)
      ORDER BY date ASC
    `;
    const trend = await this.dataSource.query(trendSql);

    return {
      summary: {
        total_incidents: Number(summary.total_incidents),
        open_incidents: Number(summary.open_incidents),
        resolved_incidents: Number(summary.resolved_incidents),
        total_extra_cost: Number(summary.total_extra_cost),
        total_product_loss: Number(summary.total_product_loss),
        total_refund: Number(summary.total_refund),
        total_compensation: Number(summary.total_compensation),
        net_loss: Number(summary.net_loss),
        orders_lost_revenue: Number(summary.orders_lost_revenue),
        lost_revenue_amount: Number(summary.lost_revenue_amount),
      },
      by_type: byType.map((r: Record<string, unknown>) => ({
        type: Number(r.type),
        typeName: INCIDENT_TYPES[Number(r.type)] || 'Khac',
        count: Number(r.count),
        extraCost: Number(r.extra_cost),
        productLoss: Number(r.product_loss),
        refund: Number(r.refund),
      })),
      by_provider: byProvider.map((r: Record<string, unknown>) => ({
        provider: r.provider,
        incidentCount: Number(r.incident_count),
        orderCount: Number(r.order_count),
        extraCost: Number(r.extra_cost),
        productLoss: Number(r.product_loss),
        incidentRate: Math.round(Number(r.incident_rate) * 10) / 10,
      })),
      trend: trend.map((r: Record<string, unknown>) => ({
        date: r.date,
        count: Number(r.count),
        loss: Number(r.loss),
      })),
    };
  }
}
