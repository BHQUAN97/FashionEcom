import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './entities/customer.entity';
import { CustomerAddressEntity } from './entities/customer-address.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { BaseService } from '@/common/services/base.service';
import { safeSortField, safeSortOrder } from '@/common/utils/safe-sort.util';

@Injectable()
export class CustomersService extends BaseService<CustomerEntity> {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
    @InjectRepository(CustomerAddressEntity)
    private readonly addressRepo: Repository<CustomerAddressEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {
    super(customerRepo, 'sysCustomerId', 'Khach hang');
  }

  /**
   * Tao khach hang — kiem tra trung so dien thoai
   */
  override async createEntity(data: Partial<CustomerEntity>): Promise<CustomerEntity> {
    if (data.sysCustomerMobile) {
      const existing = await this.customerRepo.findOne({
        where: { sysCustomerMobile: data.sysCustomerMobile },
      });
      if (existing) {
        throw new ConflictException('So dien thoai da duoc su dung');
      }
    }
    return super.createEntity(data);
  }

  /**
   * Danh sach khach hang + filter + pagination
   */
  async findAll(query: CustomerQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.customerRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'u');

    if (query.search) {
      qb.andWhere(
        '(c.sysCustomerName LIKE :s OR c.sysCustomerMobile LIKE :s OR u.sysUserEmail LIKE :s)',
        { s: `%${query.search}%` },
      );
    }
    if (query.tier !== undefined) {
      qb.andWhere('c.sysCustomerTier = :tier', { tier: query.tier });
    }

    const sortField = safeSortField(query.sort, 'customer', 'sysCustomerName');
    const sortOrder = safeSortOrder(query.order);
    qb.orderBy(`c.${sortField}`, sortOrder);

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    return this.paginate(data, total, page, limit);
  }

  /**
   * Chi tiet khach hang + stats — override de them order aggregation
   */
  override async findOne(id: string) {
    const customer = await super.findOne(id, ['user']);

    // Thong ke don hang
    const stats = await this.orderRepo
      .createQueryBuilder('o')
      .select('COUNT(*)', 'total_orders')
      .addSelect('SUM(CASE WHEN o.salOrderStatus = 4 THEN 1 ELSE 0 END)', 'completed_orders')
      .addSelect('SUM(CASE WHEN o.salOrderStatus = 4 THEN o.salOrderTotal ELSE 0 END)', 'total_spent')
      .where('o.sysCustomerId = :cid', { cid: id })
      .getRawOne();

    return {
      ...customer,
      stats: {
        total_orders: Number(stats?.total_orders || 0),
        completed_orders: Number(stats?.completed_orders || 0),
        total_spent: Number(stats?.total_spent || 0),
        avg_order_value: stats?.completed_orders > 0
          ? Number(stats.total_spent) / Number(stats.completed_orders)
          : 0,
      },
    };
  }

  /**
   * Lich su don hang cua khach
   */
  async getOrderHistory(customerId: string, page = 1, limit = 10) {
    const qb = this.orderRepo.createQueryBuilder('o')
      .where('o.sysCustomerId = :cid', { cid: customerId })
      .orderBy('o.createdDate', 'DESC');

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    return { data, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }

  /**
   * Danh sach dia chi cua khach
   */
  async getAddresses(customerId: string) {
    return this.addressRepo.find({
      where: { sysCustomerId: customerId },
      order: { sysCustomerAddressIsDefault: 'DESC' },
    });
  }
}
