import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { ProductMediaEntity } from './entities/product-media.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { BulkEditProductDto, BulkEditVariantDto } from './dto/bulk-edit.dto';
import { createSlug } from '@/common/utils/slug.util';
import { BaseService } from '@/common/services/base.service';

@Injectable()
export class ProductsService extends BaseService<ProductEntity> {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepo: Repository<ProductVariantEntity>,
    @InjectRepository(ProductMediaEntity)
    private readonly mediaRepo: Repository<ProductMediaEntity>,
  ) {
    super(productRepo, 'catProductId', 'San pham');
  }

  /**
   * Danh sach san pham voi filter, search, pagination
   */
  async findAll(query: ProductQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.productRepo.createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'c')
      .leftJoin('p.variants', 'v')
      .addSelect('COUNT(v.catProductVariantId)', 'variant_count')
      .addSelect('MIN(v.catProductVariantPrice)', 'price_min')
      .addSelect('MAX(v.catProductVariantPrice)', 'price_max')
      .groupBy('p.catProductId');

    // Search theo ten hoac ma san pham
    if (query.search) {
      qb.andWhere('(p.catProductName LIKE :s OR p.catProductCode LIKE :s)', {
        s: `%${query.search}%`,
      });
    }

    if (query.categoryId) {
      qb.andWhere('p.catCategoryId = :catId', { catId: query.categoryId });
    }

    if (query.status !== undefined) {
      qb.andWhere('p.catProductStatus = :status', { status: query.status });
    }

    // Sort
    const sortField = query.sort || 'createdDate';
    const sortOrder = query.order || 'DESC';
    qb.orderBy(`p.${sortField}`, sortOrder);

    // Count total truoc khi paginate
    const rawCount = await qb.getCount();
    const items = await qb.skip((page - 1) * limit).take(limit).getRawAndEntities();

    const data = items.entities.map((p, i) => ({
      ...p,
      variant_count: Number(items.raw[i]?.variant_count || 0),
      price_range: {
        min: Number(items.raw[i]?.price_min || 0),
        max: Number(items.raw[i]?.price_max || 0),
      },
    }));

    return this.paginate(data, rawCount, page, limit);
  }

  /**
   * Chi tiet san pham + variants + media — ke thua tu BaseService
   */
  override async findOne(id: string) {
    return super.findOne(id, ['category', 'variants', 'media']);
  }

  /**
   * Tao san pham moi
   */
  async create(dto: CreateProductDto) {
    // Check unique code
    const exists = await this.productRepo.findOne({
      where: { catProductCode: dto.code },
    });
    if (exists) throw new ConflictException('Ma san pham da ton tai');

    const product = this.productRepo.create({
      catProductId: randomUUID(),
      catCategoryId: dto.categoryId,
      catProductCode: dto.code,
      catProductName: dto.name,
      catProductSlug: dto.slug || createSlug(dto.name),
      catProductDescription: dto.description || null,
      catProductShortDesc: dto.shortDesc || null,
      catProductSeoTitle: dto.seoTitle || null,
      catProductSeoDesc: dto.seoDesc || null,
      catProductBrand: dto.brand || null,
      catProductIsFeatured: dto.isFeatured || 0,
      catProductIsNew: dto.isNew !== undefined ? dto.isNew : 1,
      catProductStatus: dto.status !== undefined ? dto.status : 1,
    });

    return this.productRepo.save(product);
  }

  /**
   * Cap nhat san pham
   */
  async update(id: string, dto: UpdateProductDto) {
    const product = await super.findOne(id);

    if (dto.name !== undefined) {
      product.catProductName = dto.name;
      if (!dto.slug) product.catProductSlug = createSlug(dto.name);
    }
    if (dto.categoryId !== undefined) product.catCategoryId = dto.categoryId;
    if (dto.description !== undefined) product.catProductDescription = dto.description;
    if (dto.shortDesc !== undefined) product.catProductShortDesc = dto.shortDesc;
    if (dto.seoTitle !== undefined) product.catProductSeoTitle = dto.seoTitle;
    if (dto.seoDesc !== undefined) product.catProductSeoDesc = dto.seoDesc;
    if (dto.slug !== undefined) product.catProductSlug = dto.slug;
    if (dto.brand !== undefined) product.catProductBrand = dto.brand;
    if (dto.isFeatured !== undefined) product.catProductIsFeatured = dto.isFeatured;
    if (dto.isNew !== undefined) product.catProductIsNew = dto.isNew;
    if (dto.status !== undefined) product.catProductStatus = dto.status;

    return this.productRepo.save(product);
  }

  /**
   * Xoa san pham (soft delete — set status = 2)
   */
  async remove(id: string) {
    const product = await super.findOne(id);
    product.catProductStatus = 2;
    return this.repo.save(product);
  }

  /**
   * Duplicate san pham (copy thong tin + variants, khong copy media)
   */
  async duplicate(id: string) {
    const source = await this.findOne(id);
    const newId = randomUUID();
    const newCode = `${source.catProductCode}-COPY`;

    const product = this.productRepo.create({
      ...source,
      catProductId: newId,
      catProductCode: newCode,
      catProductSlug: `${source.catProductSlug}-copy`,
      catProductStatus: 0, // Trang thai nhap
      createdDate: undefined as any,
      modifiedDate: null,
      category: undefined as any,
      variants: undefined as any,
      media: undefined as any,
    });
    const saved = await this.productRepo.save(product);

    // Copy variants
    if (source.variants?.length) {
      const newVariants = source.variants.map((v) =>
        this.variantRepo.create({
          ...v,
          catProductVariantId: randomUUID(),
          catProductId: newId,
          catProductVariantSku: `${v.catProductVariantSku}-COPY`,
          product: undefined as any,
        }),
      );
      await this.variantRepo.save(newVariants);
    }

    return saved;
  }

  /**
   * Bulk edit trang thai san pham
   */
  async bulkEdit(dto: BulkEditProductDto) {
    if (dto.status !== undefined) {
      await this.productRepo.update(
        { catProductId: In(dto.ids) },
        { catProductStatus: dto.status },
      );
    }
    return { updated: dto.ids.length };
  }

  // --- Variant methods ---

  /**
   * Danh sach variants cua san pham
   */
  async getVariants(productId: string) {
    return this.variantRepo.find({
      where: { catProductId: productId },
      order: { catProductVariantSku: 'ASC' },
    });
  }

  /**
   * Tao variant
   */
  async createVariant(productId: string, data: Partial<ProductVariantEntity>) {
    const variant = this.variantRepo.create({
      catProductVariantId: randomUUID(),
      catProductId: productId,
      ...data,
    });
    return this.variantRepo.save(variant);
  }

  /**
   * Cap nhat variant
   */
  async updateVariant(variantId: string, data: Partial<ProductVariantEntity>) {
    const variant = await this.variantRepo.findOne({
      where: { catProductVariantId: variantId },
    });
    if (!variant) throw new NotFoundException('Variant khong ton tai');
    Object.assign(variant, data);
    return this.variantRepo.save(variant);
  }

  /**
   * Xoa variant
   */
  async removeVariant(variantId: string) {
    const variant = await this.variantRepo.findOne({
      where: { catProductVariantId: variantId },
    });
    if (!variant) throw new NotFoundException('Variant khong ton tai');
    return this.variantRepo.remove(variant);
  }

  /**
   * Bulk edit variants (gia, trang thai)
   */
  async bulkEditVariants(dto: BulkEditVariantDto) {
    const updateData: Partial<ProductVariantEntity> = {};
    if (dto.price !== undefined) updateData.catProductVariantPrice = dto.price;
    if (dto.comparePrice !== undefined) updateData.catProductVariantComparePrice = dto.comparePrice;
    if (dto.status !== undefined) updateData.catProductVariantStatus = dto.status;

    await this.variantRepo.update(
      { catProductVariantId: In(dto.ids) },
      updateData,
    );
    return { updated: dto.ids.length };
  }
}
