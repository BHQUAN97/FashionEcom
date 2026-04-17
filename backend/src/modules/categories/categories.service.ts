import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoryDto } from './dto/reorder-category.dto';
import { createSlug } from '@/common/utils/slug.util';
import { BaseService } from '@/common/services/base.service';

/**
 * CategoriesService — ke thua BaseService de tai su dung CRUD chuan
 * (findOne, createEntity, updateEntity, deleteEntity).
 * Method rieng: getTree (tree build), create/update/remove (co business rule rieng),
 * reorder (batch update).
 */
@Injectable()
export class CategoriesService extends BaseService<CategoryEntity> {
  constructor(
    @InjectRepository(CategoryEntity)
    categoryRepo: Repository<CategoryEntity>,
  ) {
    super(categoryRepo, 'catCategoryId', 'Danh muc');
  }

  /** Alias ro nghia trong module — dung lai repo do BaseService giu */
  private get categoryRepo(): Repository<CategoryEntity> {
    return this.repo;
  }

  /**
   * Lay tree danh muc — recursive query, tra ve nested structure
   */
  async getTree() {
    const all = await this.categoryRepo.find({
      order: { catCategorySort: 'ASC', catCategoryName: 'ASC' },
    });

    // Xay dung tree tu flat list
    type CategoryNode = CategoryEntity & { children: CategoryNode[] };
    const map = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    all.forEach((c) => {
      map.set(c.catCategoryId, { ...c, children: [] });
    });

    all.forEach((c) => {
      const node = map.get(c.catCategoryId)!;
      if (c.catCategoryParentId && map.has(c.catCategoryParentId)) {
        map.get(c.catCategoryParentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Lay flat list (cho dropdown select)
   */
  async findAll() {
    return this.categoryRepo.find({
      order: { catCategorySort: 'ASC' },
    });
  }

  /**
   * Chi tiet danh muc — override BaseService.findOne de tra kem relation children
   * (API contract khong doi: nhan id, tra CategoryEntity hoac throw NotFound)
   */
  async findOne(id: string, relations?: string[]): Promise<CategoryEntity> {
    return super.findOne(id, relations ?? ['children']);
  }

  /**
   * Tao danh muc moi — co business rule rieng (check code, auto slug)
   */
  async create(dto: CreateCategoryDto) {
    const exists = await this.categoryRepo.findOne({
      where: { catCategoryCode: dto.code },
    });
    if (exists) throw new ConflictException('Ma danh muc da ton tai');

    const category = this.categoryRepo.create({
      catCategoryId: randomUUID(),
      catCategoryCode: dto.code,
      catCategoryName: dto.name,
      catCategorySlug: dto.slug || createSlug(dto.name),
      catCategoryParentId: dto.parentId || null,
      catCategoryDescription: dto.description || null,
      catCategoryIcon: dto.icon || null,
      catCategoryBanner: dto.banner || null,
      catCategoryStatus: 1,
    });

    return this.categoryRepo.save(category);
  }

  /**
   * Cap nhat danh muc — co business rule (circular check, auto slug theo ten)
   */
  async update(id: string, dto: UpdateCategoryDto) {
    // Dung helper findOne cua BaseService de bat NotFound chuan
    const category = await super.findOne(id);

    if (dto.name !== undefined) {
      category.catCategoryName = dto.name;
      if (!dto.slug) category.catCategorySlug = createSlug(dto.name);
    }
    if (dto.parentId !== undefined) {
      // Chong circular reference — khong cho set parentId = chinh minh
      if (dto.parentId === id) {
        throw new ConflictException('Danh muc khong the la danh muc cha cua chinh no');
      }
      category.catCategoryParentId = dto.parentId;
    }
    if (dto.slug !== undefined) category.catCategorySlug = dto.slug;
    if (dto.description !== undefined) category.catCategoryDescription = dto.description;
    if (dto.icon !== undefined) category.catCategoryIcon = dto.icon;
    if (dto.banner !== undefined) category.catCategoryBanner = dto.banner;
    if (dto.status !== undefined) category.catCategoryStatus = dto.status;

    return this.categoryRepo.save(category);
  }

  /**
   * Xoa danh muc (chi xoa khi khong co danh muc con)
   * KHONG dung deleteEntity cua BaseService vi can load kem children + check
   */
  async remove(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { catCategoryId: id },
      relations: ['children'],
    });
    if (!category) throw new NotFoundException('Danh muc khong ton tai');
    if (category.children?.length > 0) {
      throw new ConflictException('Khong the xoa danh muc co danh muc con');
    }
    return this.categoryRepo.remove(category);
  }

  /**
   * Sap xep lai cay danh muc — batch update parent_id + sort
   */
  async reorder(dto: ReorderCategoryDto) {
    const promises = dto.items.map((item) =>
      this.categoryRepo.update(item.id, {
        catCategoryParentId: item.parentId || null,
        catCategorySort: item.sort,
      }),
    );
    await Promise.all(promises);
    return { updated: dto.items.length };
  }
}
