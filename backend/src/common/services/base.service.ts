import { Repository, FindOptionsWhere, FindOptionsOrder, ObjectLiteral } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

/**
 * Generic CRUD base service — moi module ke thua de tranh duplicate
 * Cung cap: findAll (paginated), findOne, create, update, softDelete
 * Module con chi can override neu co logic rieng
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export abstract class BaseService<T extends ObjectLiteral> {
  constructor(
    protected readonly repo: Repository<T>,
    /** Ten PK column — VD: 'salOrderId', 'catProductId' */
    protected readonly pkField: string,
    /** Ten hien thi cho error message */
    protected readonly entityName: string = 'Ban ghi',
  ) {}

  /**
   * Danh sach co phan trang (simple) — dung cho module don gian
   * Module phuc tap nen tu dinh nghia findAll voi QueryBuilder + this.paginate()
   */
  async findAllBase(
    page = 1,
    limit = 20,
    options?: { where?: FindOptionsWhere<T>; relations?: string[]; order?: FindOptionsOrder<T> },
  ): Promise<PaginatedResult<T>> {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    // Fallback order — dung createdDate DESC khi caller khong truyen
    const defaultOrder = { createdDate: 'DESC' } as unknown as FindOptionsOrder<T>;

    const [data, total] = await this.repo.findAndCount({
      where: options?.where,
      relations: options?.relations,
      order: options?.order ?? defaultOrder,
      skip,
      take,
    });

    return {
      data,
      pagination: {
        page,
        limit: take,
        total,
        total_pages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Tim 1 ban ghi theo PK
   */
  async findOne(id: string, relations?: string[]): Promise<T> {
    const where = { [this.pkField]: id } as FindOptionsWhere<T>;
    const entity = await this.repo.findOne({ where, relations });
    if (!entity) {
      throw new NotFoundException(`${this.entityName} khong ton tai`);
    }
    return entity;
  }

  /**
   * Tao ban ghi moi
   */
  async createEntity(data: Partial<T>): Promise<T> {
    const entity = this.repo.create(data as T);
    return this.repo.save(entity);
  }

  /**
   * Cap nhat ban ghi
   */
  async updateEntity(id: string, data: Partial<T>): Promise<T> {
    const entity = await this.findOne(id);
    Object.assign(entity, data);
    return this.repo.save(entity);
  }

  /**
   * Xoa ban ghi (hard delete)
   */
  async deleteEntity(id: string): Promise<void> {
    const entity = await this.findOne(id);
    await this.repo.remove(entity);
  }

  /**
   * Helper: build pagination result tu data + total
   */
  protected paginate(data: T[], total: number, page: number, limit: number): PaginatedResult<T> {
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  }
}
