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

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepo: Repository<CategoryEntity>,
  ) {}

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
   * Chi tiet danh muc
   */
  async findOne(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { catCategoryId: id },
      relations: ['children'],
    });
    if (!category) throw new NotFoundException('Danh muc khong ton tai');
    return category;
  }

  /**
   * Tao danh muc moi
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
   * Cap nhat danh muc
   */
  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOne({ where: { catCategoryId: id } });
    if (!category) throw new NotFoundException('Danh muc khong ton tai');

    if (dto.name !== undefined) {
      category.catCategoryName = dto.name;
      if (!dto.slug) category.catCategorySlug = createSlug(dto.name);
    }
    if (dto.parentId !== undefined) category.catCategoryParentId = dto.parentId;
    if (dto.slug !== undefined) category.catCategorySlug = dto.slug;
    if (dto.description !== undefined) category.catCategoryDescription = dto.description;
    if (dto.icon !== undefined) category.catCategoryIcon = dto.icon;
    if (dto.banner !== undefined) category.catCategoryBanner = dto.banner;
    if (dto.status !== undefined) category.catCategoryStatus = dto.status;

    return this.categoryRepo.save(category);
  }

  /**
   * Xoa danh muc (chi xoa khi khong co san pham)
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
