import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders.service';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderTimelineEntity } from './entities/order-timeline.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderRepo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let timelineRepo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let itemRepo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryRunner: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryRunnerManager: any;

  // Helper: tao mock order
  const makeOrder = (overrides: Partial<OrderEntity> = {}): OrderEntity =>
    ({
      salOrderId: 'order-1',
      salOrderCode: 'DH-0001',
      sysCustomerId: 'cust-1',
      salOrderSubtotal: 500000,
      salOrderDiscount: 0,
      salOrderShippingFee: 30000,
      salOrderTotal: 530000,
      salOrderStatus: 0,
      salOrderPaymentStatus: 0,
      salOrderPaymentType: 0,
      salOrderInternalNote: null,
      createdDate: new Date('2026-01-01'),
      timeline: [],
      items: [],
      ...overrides,
    }) as OrderEntity;

  // Mock QueryBuilder chain
  const mockQb = () => {
    const qb: Record<string, jest.Mock> = {};
    qb.andWhere = jest.fn().mockReturnValue(qb);
    qb.where = jest.fn().mockReturnValue(qb);
    qb.orderBy = jest.fn().mockReturnValue(qb);
    qb.skip = jest.fn().mockReturnValue(qb);
    qb.take = jest.fn().mockReturnValue(qb);
    qb.getCount = jest.fn().mockResolvedValue(0);
    qb.getMany = jest.fn().mockResolvedValue([]);
    qb.select = jest.fn().mockReturnValue(qb);
    qb.addSelect = jest.fn().mockReturnValue(qb);
    qb.groupBy = jest.fn().mockReturnValue(qb);
    qb.getRawMany = jest.fn().mockResolvedValue([]);
    return qb;
  };

  beforeEach(async () => {
    const qb = mockQb();

    orderRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((e) => e),
      metadata: { primaryColumns: [{ propertyName: 'salOrderId' }] },
    };

    timelineRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((e) => e),
      find: jest.fn().mockResolvedValue([]),
    };

    itemRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    // Mock queryRunner.manager — service gio dung queryRunner.manager.save thay vi repo.save
    queryRunnerManager = {
      save: jest.fn().mockImplementation((_entity, data) => Promise.resolve(data)),
      update: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      query: jest.fn().mockResolvedValue([]),
    };

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: queryRunnerManager,
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
      query: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(OrderEntity), useValue: orderRepo },
        { provide: getRepositoryToken(OrderItemEntity), useValue: itemRepo },
        { provide: getRepositoryToken(OrderTimelineEntity), useValue: timelineRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  // ── STATE MACHINE TRANSITIONS ──

  describe('updateStatus — state machine', () => {
    it('cho phep Pending(0) -> Confirmed(1)', async () => {
      const order = makeOrder({ salOrderStatus: 0 });
      orderRepo.findOne.mockResolvedValue(order);

      const result = await service.updateStatus('order-1', { status: 1 }, 'admin');
      expect(result.salOrderStatus).toBe(1);
      // Service gio save qua queryRunner.manager.save(OrderEntity, order) trong transaction
      expect(queryRunnerManager.save).toHaveBeenCalledWith(
        OrderEntity,
        expect.objectContaining({ salOrderStatus: 1 }),
      );
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    });

    it('cho phep Pending(0) -> Cancelled(5)', async () => {
      const order = makeOrder({ salOrderStatus: 0 });
      orderRepo.findOne.mockResolvedValue(order);

      const result = await service.updateStatus('order-1', { status: 5 }, 'admin');
      expect(result.salOrderStatus).toBe(5);
    });

    it('cho phep Confirmed(1) -> Packing(2)', async () => {
      const order = makeOrder({ salOrderStatus: 1 });
      orderRepo.findOne.mockResolvedValue(order);

      const result = await service.updateStatus('order-1', { status: 2 }, 'admin');
      expect(result.salOrderStatus).toBe(2);
    });

    it('cho phep Packing(2) -> Shipping(3)', async () => {
      const order = makeOrder({ salOrderStatus: 2 });
      orderRepo.findOne.mockResolvedValue(order);

      const result = await service.updateStatus('order-1', { status: 3 }, 'admin');
      expect(result.salOrderStatus).toBe(3);
    });

    it('cho phep Shipping(3) -> Completed(4)', async () => {
      const order = makeOrder({ salOrderStatus: 3 });
      orderRepo.findOne.mockResolvedValue(order);

      const result = await service.updateStatus('order-1', { status: 4 }, 'admin');
      expect(result.salOrderStatus).toBe(4);
    });

    it('cho phep Completed(4) -> Return(6)', async () => {
      const order = makeOrder({ salOrderStatus: 4 });
      orderRepo.findOne.mockResolvedValue(order);

      const result = await service.updateStatus('order-1', { status: 6 }, 'admin');
      expect(result.salOrderStatus).toBe(6);
    });

    it('KHONG cho phep nhay trang thai: 0 -> 3', async () => {
      const order = makeOrder({ salOrderStatus: 0 });
      orderRepo.findOne.mockResolvedValue(order);

      await expect(
        service.updateStatus('order-1', { status: 3 }, 'admin'),
      ).rejects.toThrow(BadRequestException);
    });

    it('KHONG cho phep di nguoc: 4 -> 1', async () => {
      const order = makeOrder({ salOrderStatus: 4 });
      orderRepo.findOne.mockResolvedValue(order);

      await expect(
        service.updateStatus('order-1', { status: 1 }, 'admin'),
      ).rejects.toThrow(BadRequestException);
    });

    it('KHONG cho phep chuyen tu Cancelled(5)', async () => {
      const order = makeOrder({ salOrderStatus: 5 });
      orderRepo.findOne.mockResolvedValue(order);

      await expect(
        service.updateStatus('order-1', { status: 1 }, 'admin'),
      ).rejects.toThrow(BadRequestException);
    });

    it('KHONG cho phep chuyen tu Return(6)', async () => {
      const order = makeOrder({ salOrderStatus: 6 });
      orderRepo.findOne.mockResolvedValue(order);

      await expect(
        service.updateStatus('order-1', { status: 0 }, 'admin'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── TIMELINE ──

  describe('updateStatus — timeline entry', () => {
    it('tao timeline entry voi actor va status label', async () => {
      const order = makeOrder({ salOrderStatus: 0 });
      orderRepo.findOne.mockResolvedValue(order);

      await service.updateStatus('order-1', { status: 1, note: 'Xac nhan nhanh' }, 'staff-1');

      expect(timelineRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          salOrderId: 'order-1',
          salOrderTimelineStep: 1,
          salOrderTimelineStatus: 'Đã xác nhận',
          salOrderTimelineLabel: 'Đã xác nhận',
          salOrderTimelineNote: 'Xac nhan nhanh',
          salOrderTimelineActor: 'staff-1',
        }),
      );
      // Timeline entity duoc save qua queryRunner.manager (trong transaction)
      expect(queryRunnerManager.save).toHaveBeenCalledWith(
        OrderTimelineEntity,
        expect.objectContaining({ salOrderTimelineActor: 'staff-1' }),
      );
    });

    it('timeline note la null khi khong truyen', async () => {
      const order = makeOrder({ salOrderStatus: 1 });
      orderRepo.findOne.mockResolvedValue(order);

      await service.updateStatus('order-1', { status: 2 }, 'admin');

      expect(timelineRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ salOrderTimelineNote: null }),
      );
    });
  });

  // ── INTERNAL NOTE ──

  describe('updateStatus — internal note', () => {
    it('cap nhat internal note khi truyen dto.note', async () => {
      const order = makeOrder({ salOrderStatus: 0, salOrderInternalNote: null });
      orderRepo.findOne.mockResolvedValue(order);

      await service.updateStatus('order-1', { status: 1, note: 'Ghi chu noi bo' }, 'admin');
      expect(order.salOrderInternalNote).toBe('Ghi chu noi bo');
    });

    it('khong ghi de note cu khi khong truyen', async () => {
      const order = makeOrder({ salOrderStatus: 0, salOrderInternalNote: 'Note cu' });
      orderRepo.findOne.mockResolvedValue(order);

      await service.updateStatus('order-1', { status: 1 }, 'admin');
      expect(order.salOrderInternalNote).toBe('Note cu');
    });
  });

  // ── BULK ACTION ──

  describe('bulkAction', () => {
    it('confirm hang loat — tat ca thanh cong', async () => {
      const o1 = makeOrder({ salOrderId: 'o1', salOrderStatus: 0 });
      const o2 = makeOrder({ salOrderId: 'o2', salOrderStatus: 0 });
      orderRepo.findOne
        .mockResolvedValueOnce(o1)
        .mockResolvedValueOnce(o2);

      const result = await service.bulkAction(
        { ids: ['o1', 'o2'], action: 'confirm' },
        'admin',
      );

      expect(result).toEqual(expect.objectContaining({ processed: 2, failed: 0, total: 2 }));
    });

    it('cancel hang loat', async () => {
      const o1 = makeOrder({ salOrderId: 'o1', salOrderStatus: 0 });
      orderRepo.findOne.mockResolvedValue(o1);

      const result = await service.bulkAction(
        { ids: ['o1'], action: 'cancel' },
        'admin',
      );

      expect(result.processed).toBe(1);
    });

    it('throw BadRequest khi action khong hop le', async () => {
      // DTO @IsIn se chan truoc, nhung service van throw neu nhan gia tri la
      await expect(
        service.bulkAction({ ids: ['o1'], action: 'refund' as never }, 'admin'),
      ).rejects.toThrow(BadRequestException);
    });

    it('bo qua don bi loi — partial success', async () => {
      // o1 OK (status 0 -> 1), o2 da Cancelled (5 -> 1 fail)
      const o1 = makeOrder({ salOrderId: 'o1', salOrderStatus: 0 });
      const o2 = makeOrder({ salOrderId: 'o2', salOrderStatus: 5 });
      orderRepo.findOne
        .mockResolvedValueOnce(o1)  // findOne cho o1
        .mockResolvedValueOnce(o2); // findOne cho o2

      const result = await service.bulkAction(
        { ids: ['o1', 'o2'], action: 'confirm' },
        'admin',
      );

      expect(result).toEqual(expect.objectContaining({ processed: 1, failed: 1, total: 2 }));
    });
  });

  // ── GET TIMELINE ──

  describe('getTimeline', () => {
    it('tra ve timeline theo orderId, sap xep DESC', async () => {
      const entries = [
        { salOrderTimelineStep: 1, createdDate: new Date('2026-01-02') },
        { salOrderTimelineStep: 0, createdDate: new Date('2026-01-01') },
      ];
      timelineRepo.find.mockResolvedValue(entries);

      const result = await service.getTimeline('order-1');

      expect(timelineRepo.find).toHaveBeenCalledWith({
        where: { salOrderId: 'order-1' },
        order: { createdDate: 'DESC' },
      });
      expect(result).toEqual(entries);
    });
  });

  // ── FIND ALL — PAGINATION + FILTERS ──

  describe('findAll', () => {
    it('gioi han limit toi da 100', async () => {
      const qb = mockQb();
      const statsQb = mockQb();
      const shipStatsQb = mockQb();
      orderRepo.createQueryBuilder
        .mockReturnValueOnce(qb)
        .mockReturnValueOnce(statsQb)
        .mockReturnValueOnce(shipStatsQb);
      orderRepo.count = jest.fn().mockResolvedValue(0);

      await service.findAll({ limit: 200 } as any);

      expect(qb.take).toHaveBeenCalledWith(100);
    });

    it('ap dung filter search, status, date range', async () => {
      const qb = mockQb();
      const statsQb = mockQb();
      const shipStatsQb = mockQb();
      orderRepo.createQueryBuilder
        .mockReturnValueOnce(qb)
        .mockReturnValueOnce(statsQb)
        .mockReturnValueOnce(shipStatsQb);
      orderRepo.count = jest.fn().mockResolvedValue(0);

      await service.findAll({
        search: 'DH-001',
        status: 1,
        dateFrom: '2026-01-01',
        dateTo: '2026-12-31',
      } as any);

      // andWhere duoc goi cho search, status, dateFrom, dateTo = 4 lan
      expect(qb.andWhere).toHaveBeenCalledTimes(4);
    });

    it('tra ve stats grouped by status', async () => {
      const qb = mockQb();
      const statsQb = mockQb();
      const shipStatsQb = mockQb();
      statsQb.getRawMany.mockResolvedValue([
        { status: 0, count: '5' },
        { status: 1, count: '3' },
      ]);
      shipStatsQb.getRawMany.mockResolvedValue([]);
      orderRepo.createQueryBuilder
        .mockReturnValueOnce(qb)
        .mockReturnValueOnce(statsQb)
        .mockReturnValueOnce(shipStatsQb);
      orderRepo.count = jest.fn().mockResolvedValue(0);

      const result = await service.findAll({} as any);

      expect(result.stats).toEqual({ 0: 5, 1: 3 });
    });
  });

  // ── FIND ONE ──

  describe('findOne', () => {
    it('throw NotFoundException khi khong tim thay', async () => {
      orderRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('sort timeline DESC khi co data', async () => {
      // Service gio query timeline rieng qua timelineRepo.find (LIMIT 20, DESC)
      const order = makeOrder({ timeline: [] });
      orderRepo.findOne.mockResolvedValue(order);

      // Repo tra timeline da sort DESC (database handle sort qua order clause)
      const sortedTimeline = [
        { createdDate: new Date('2026-01-03') } as any,
        { createdDate: new Date('2026-01-02') } as any,
        { createdDate: new Date('2026-01-01') } as any,
      ];
      timelineRepo.find.mockResolvedValue(sortedTimeline);

      const result = await service.findOne('order-1');

      // Verify goi find voi sort DESC + take 20
      expect(timelineRepo.find).toHaveBeenCalledWith({
        where: { salOrderId: 'order-1' },
        order: { createdDate: 'DESC' },
        take: 20,
      });
      // Timeline[0] phai la moi nhat (01-03)
      expect(result.timeline[0].createdDate).toEqual(new Date('2026-01-03'));
      expect(result.timeline[2].createdDate).toEqual(new Date('2026-01-01'));
    });
  });
});
