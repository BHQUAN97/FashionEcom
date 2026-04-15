import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { ProductMediaEntity } from './entities/product-media.entity';
import { ColorEntity } from '../attributes/entities/color.entity';
import { SizeEntity } from '../attributes/entities/size.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { BulkEditProductDto, BulkEditVariantDto } from './dto/bulk-edit.dto';
import { GenerateVariantsDto } from './dto/generate-variants.dto';
import { createSlug } from '@/common/utils/slug.util';
import { safeSortField, safeSortOrder } from '@/common/utils/safe-sort.util';
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
    @InjectRepository(ColorEntity)
    private readonly colorRepo: Repository<ColorEntity>,
    @InjectRepository(SizeEntity)
    private readonly sizeRepo: Repository<SizeEntity>,
  ) {
    super(productRepo, 'catProductId', 'Sản phẩm');
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
    } else {
      // Mac dinh loai tru san pham da xoa (status=2)
      qb.andWhere('p.catProductStatus != :deleted', { deleted: 2 });
    }

    // Sort — whitelist validation chong SQL injection
    const sortField = safeSortField(query.sort, 'product', 'createdDate');
    const sortOrder = safeSortOrder(query.order);
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
   * Chi tiet san pham + variants (eager load color/size) + media
   */
  override async findOne(id: string) {
    return super.findOne(id, ['category', 'variants', 'variants.color', 'variants.size', 'variants.size.sizeGroup', 'media']);
  }

  /**
   * Tim san pham theo slug — dung cho storefront public URL
   */
  async findBySlug(slug: string) {
    const product = await this.productRepo.findOne({
      where: { catProductSlug: slug },
      relations: ['category', 'variants', 'variants.color', 'variants.size', 'variants.size.sizeGroup', 'media'],
    });
    if (!product) throw new NotFoundException('San pham khong ton tai');
    // Khong tra ve san pham da xoa (soft delete)
    if (product.catProductStatus === 2) {
      throw new NotFoundException('San pham khong ton tai');
    }
    return product;
  }

  /**
   * Tao san pham moi
   */
  async create(dto: CreateProductDto) {
    // Check unique code
    const exists = await this.productRepo.findOne({
      where: { catProductCode: dto.code },
    });
    if (exists) throw new ConflictException('Mã sản phẩm đã tồn tại');

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
      catProductOrigin: dto.origin || null,
      catProductMaterial: dto.material || null,
      catProductPackagingType: dto.packagingType || null,
      catProductCondition: dto.condition || 'new',
      catProductWeight: dto.weight || 0,
      catProductLength: dto.length || 0,
      catProductWidth: dto.width || 0,
      catProductHeight: dto.height || 0,
      catProductPreOrder: dto.preOrder || 0,
      catProductPreOrderDays: dto.preOrderDays || 7,
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
    if (dto.origin !== undefined) product.catProductOrigin = dto.origin;
    if (dto.material !== undefined) product.catProductMaterial = dto.material;
    if (dto.packagingType !== undefined) product.catProductPackagingType = dto.packagingType;
    if (dto.condition !== undefined) product.catProductCondition = dto.condition;
    if (dto.weight !== undefined) product.catProductWeight = dto.weight;
    if (dto.length !== undefined) product.catProductLength = dto.length;
    if (dto.width !== undefined) product.catProductWidth = dto.width;
    if (dto.height !== undefined) product.catProductHeight = dto.height;
    if (dto.preOrder !== undefined) product.catProductPreOrder = dto.preOrder;
    if (dto.preOrderDays !== undefined) product.catProductPreOrderDays = dto.preOrderDays;

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
   * Batch fetch variants theo IDs — dung cho cart validate, payment verify
   */
  async getVariantsByIds(variantIds: string[]) {
    if (variantIds.length === 0) return [];
    return this.variantRepo.find({
      where: { catProductVariantId: In(variantIds) },
      relations: ['color', 'size'],
    });
  }

  /**
   * Danh sach variants cua san pham — load color/size relations
   */
  async getVariants(productId: string) {
    return this.variantRepo.find({
      where: { catProductId: productId },
      relations: ['color', 'size', 'size.sizeGroup'],
      order: { catProductVariantSku: 'ASC' },
    });
  }

  /**
   * Tao variant — validate color/size FK truoc khi save
   */
  async createVariant(productId: string, data: Partial<ProductVariantEntity>) {
    if (data.catColorId) {
      const color = await this.colorRepo.findOne({ where: { catColorId: data.catColorId } });
      if (!color) throw new BadRequestException('Mau sac khong ton tai');
      // Dong bo ten mau vao cot text cu (backward compat)
      data.catProductVariantColor = color.catColorName;
    }
    if (data.catSizeId) {
      const size = await this.sizeRepo.findOne({ where: { catSizeId: data.catSizeId } });
      if (!size) throw new BadRequestException('Size khong ton tai');
      data.catProductVariantSize = size.catSizeValue;
    }

    // Check SKU uniqueness
    if (data.catProductVariantSku) {
      const existingSku = await this.variantRepo.findOne({
        where: { catProductVariantSku: data.catProductVariantSku },
      });
      if (existingSku) {
        throw new ConflictException(`SKU ${data.catProductVariantSku} da ton tai`);
      }
    }

    const variant = this.variantRepo.create({
      catProductVariantId: randomUUID(),
      catProductId: productId,
      ...data,
    });
    return this.variantRepo.save(variant);
  }

  /**
   * Cap nhat variant — validate FK, dong bo text
   */
  async updateVariant(variantId: string, data: Partial<ProductVariantEntity>) {
    const variant = await this.variantRepo.findOne({
      where: { catProductVariantId: variantId },
    });
    if (!variant) throw new NotFoundException('Variant không tồn tại');

    if (data.catColorId) {
      const color = await this.colorRepo.findOne({ where: { catColorId: data.catColorId } });
      if (!color) throw new BadRequestException('Mau sac khong ton tai');
      data.catProductVariantColor = color.catColorName;
    }
    if (data.catSizeId) {
      const size = await this.sizeRepo.findOne({ where: { catSizeId: data.catSizeId } });
      if (!size) throw new BadRequestException('Size khong ton tai');
      data.catProductVariantSize = size.catSizeValue;
    }

    Object.assign(variant, data);
    return this.variantRepo.save(variant);
  }

  /**
   * Generate variant matrix tu danh sach colorIds x sizeIds
   * Tao combo, bo qua cac cap da ton tai. Moi variant co gia mac dinh.
   */
  async generateVariantMatrix(productId: string, dto: GenerateVariantsDto) {
    await super.findOne(productId); // verify product exists

    const colors = dto.colorIds?.length
      ? await this.colorRepo.find({ where: { catColorId: In(dto.colorIds) } })
      : [null];
    const sizes = dto.sizeIds?.length
      ? await this.sizeRepo.find({ where: { catSizeId: In(dto.sizeIds) } })
      : [null];

    // Lay existing variants de skip duplicate
    const existing = await this.variantRepo.find({
      where: { catProductId: productId },
    });
    const existingKeys = new Set(
      existing.map((v) => `${v.catColorId || ''}_${v.catSizeId || ''}`),
    );

    // Lay product code de sinh SKU
    const product = await this.productRepo.findOne({ where: { catProductId: productId } });

    const newVariants: ProductVariantEntity[] = [];
    let skuIndex = existing.length + 1;

    for (const color of colors) {
      for (const size of sizes) {
        const colorId = color?.catColorId || null;
        const sizeId = size?.catSizeId || null;
        const key = `${colorId || ''}_${sizeId || ''}`;

        if (existingKeys.has(key)) continue;

        // Sinh SKU: PRODUCT_CODE-COLOR-SIZE
        const skuParts = [product!.catProductCode];
        if (color) skuParts.push(color.catColorName.substring(0, 5).toUpperCase());
        if (size) skuParts.push(size.catSizeValue);
        let sku = skuParts.join('-');
        if (sku.length > 20) sku = `${product!.catProductCode}-${skuIndex}`;

        newVariants.push(
          this.variantRepo.create({
            catProductVariantId: randomUUID(),
            catProductId: productId,
            catProductVariantSku: sku,
            catColorId: colorId,
            catSizeId: sizeId,
            catProductVariantColor: color?.catColorName || null,
            catProductVariantSize: size?.catSizeValue || null,
            catProductVariantPrice: dto.defaultPrice || 0,
            catProductVariantComparePrice: dto.defaultComparePrice || 0,
            catProductVariantCost: dto.defaultCost || 0,
            catProductVariantWeight: dto.defaultWeight || 0,
            catProductVariantStatus: 1,
          }),
        );
        skuIndex++;
      }
    }

    // Check SKU uniqueness truoc khi save, append random suffix neu trung
    for (const v of newVariants) {
      const exists = await this.variantRepo.findOne({
        where: { catProductVariantSku: v.catProductVariantSku },
      });
      if (exists) {
        const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
        v.catProductVariantSku = `${v.catProductVariantSku.substring(0, 16)}-${suffix}`;
      }
    }

    if (newVariants.length > 0) {
      await this.variantRepo.save(newVariants);
    }

    return {
      created: newVariants.length,
      skipped: (colors.length * sizes.length) - newVariants.length,
      total: existing.length + newVariants.length,
    };
  }

  /**
   * Xoa variant
   */
  async removeVariant(variantId: string) {
    const variant = await this.variantRepo.findOne({
      where: { catProductVariantId: variantId },
    });
    if (!variant) throw new NotFoundException('Variant không tồn tại');
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
