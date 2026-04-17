import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InventoryService } from './inventory.service';
import { InventoryLevelEntity } from './entities/inventory-level.entity';
import { InventoryLogEntity } from './entities/inventory-log.entity';
import { WarehouseEntity } from './entities/warehouse.entity';
import { ProductVariantEntity } from '../products/entities/product-variant.entity';

describe('InventoryService', () => {
  let service: InventoryService;
  let queryRunnerManager: Record<string, jest.Mock>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryRunner: any;

  beforeEach(async () => {
    // Mock queryRunner cho pessimistic lock test
    queryRunnerManager = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((_entity, dto) => dto),
      save: jest.fn().mockImplementation((entity) => entity),
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
    };

    const mockLevelRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
      }),
      metadata: { primaryColumns: [{ propertyName: 'invInventoryLevelId' }] },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(InventoryLevelEntity), useValue: mockLevelRepo },
        { provide: getRepositoryToken(InventoryLogEntity), useValue: { create: jest.fn(), save: jest.fn() } },
        { provide: getRepositoryToken(WarehouseEntity), useValue: { find: jest.fn() } },
        { provide: getRepositoryToken(ProductVariantEntity), useValue: { findOne: jest.fn() } },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    jest.clearAllMocks();
  });

  describe('adjust', () => {
    const dto = { variantId: 'variant-1', warehouseId: 'wh-1', qty: 10, reason: 'import' };

    it('nen tao inventory level moi neu chua co', async () => {
      queryRunnerManager.findOne
        .mockResolvedValueOnce({ invWarehouseId: 'wh-1' }) // warehouse exists
        .mockResolvedValueOnce(null); // no existing level

      await service.adjust(dto, 'user-1');

      // Verify transaction duoc commit
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      // Verify save duoc goi 2 lan (level + log)
      expect(queryRunnerManager.save).toHaveBeenCalledTimes(2);
    });

    it('nen cap nhat inventory level co san', async () => {
      const existingLevel = {
        invInventoryLevelId: 'level-1',
        catProductVariantId: 'variant-1',
        invWarehouseId: 'wh-1',
        invInventoryLevelAvailable: 50,
        invInventoryLevelLocked: 0,
      };
      queryRunnerManager.findOne
        .mockResolvedValueOnce({ invWarehouseId: 'wh-1' }) // warehouse exists
        .mockResolvedValueOnce(existingLevel);

      await service.adjust(dto, 'user-1');

      // available = 50 + 10 = 60
      expect(existingLevel.invInventoryLevelAvailable).toBe(60);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('nen throw BadRequestException khi ton kho am', async () => {
      const existingLevel = {
        invInventoryLevelAvailable: 5,
        invInventoryLevelLocked: 0,
      };
      queryRunnerManager.findOne
        .mockResolvedValueOnce({ invWarehouseId: 'wh-1' }) // warehouse exists
        .mockResolvedValueOnce(existingLevel);

      await expect(
        service.adjust({ ...dto, qty: -10 }, 'user-1'),
      ).rejects.toThrow(BadRequestException);

      // Verify rollback
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('nen dung pessimistic_write lock', async () => {
      queryRunnerManager.findOne
        .mockResolvedValueOnce({ invWarehouseId: 'wh-1' }) // warehouse exists
        .mockResolvedValueOnce(null); // no existing level

      await service.adjust(dto, 'user-1');

      // Verify findOne duoc goi voi lock mode
      expect(queryRunnerManager.findOne).toHaveBeenCalledWith(
        InventoryLevelEntity,
        expect.objectContaining({
          lock: { mode: 'pessimistic_write' },
        }),
      );
    });

    it('nen rollback khi co loi bat ky', async () => {
      queryRunnerManager.findOne.mockRejectedValue(new Error('DB connection lost'));

      await expect(service.adjust(dto, 'user-1')).rejects.toThrow('DB connection lost');
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
