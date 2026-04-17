import { randomUUID } from 'crypto';
import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import { ColorEntity } from './entities/color.entity';
import { SizeGroupEntity } from './entities/size-group.entity';
import { SizeEntity } from './entities/size.entity';
import { CreateColorDto, UpdateColorDto } from './dto/create-color.dto';
import { CreateSizeGroupDto, UpdateSizeGroupDto } from './dto/create-size-group.dto';

/**
 * AttributesService quan ly 3 entity (Color, SizeGroup, Size) nen khong the extend
 * BaseService truc tiep (BaseService gia dinh 1 repo). Thay vao do tai su dung
 * cac helper CRUD chung qua method private — tranh duplicate NotFound / find logic.
 */
@Injectable()
export class AttributesService {
  private readonly logger = new Logger(AttributesService.name);

  constructor(
    @InjectRepository(ColorEntity)
    private readonly colorRepo: Repository<ColorEntity>,
    @InjectRepository(SizeGroupEntity)
    private readonly sizeGroupRepo: Repository<SizeGroupEntity>,
    @InjectRepository(SizeEntity)
    private readonly sizeRepo: Repository<SizeEntity>,
  ) {}

  // --- Helpers chung (tuong duong BaseService.findOne) ---

  /** Tim 1 ban ghi theo PK; throw NotFound neu khong ton tai */
  private async findOrFail<E extends ObjectLiteral>(
    repo: Repository<E>,
    pkField: keyof E & string,
    id: string,
    entityName: string,
  ): Promise<E> {
    const where = { [pkField]: id } as FindOptionsWhere<E>;
    const entity = await repo.findOne({ where });
    if (!entity) throw new NotFoundException(`${entityName} khong ton tai`);
    return entity;
  }

  /** Parse JSON an toan — neu fail return default va log warning */
  private safeJsonParse<R>(raw: string, fallback: R, context: string): R {
    try {
      return JSON.parse(raw) as R;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`JSON parse failed [${context}]: ${msg} — fallback dung gia tri mac dinh`);
      return fallback;
    }
  }

  // --- Colors ---

  async findAllColors() {
    return this.colorRepo.find({ order: { catColorSort: 'ASC' } });
  }

  async createColor(dto: CreateColorDto) {
    const exists = await this.colorRepo.findOne({
      where: { catColorName: dto.name },
    });
    if (exists) throw new ConflictException('Ten mau da ton tai');

    const color = this.colorRepo.create({
      catColorId: randomUUID(),
      catColorName: dto.name,
      catColorHex: dto.hex,
      catColorSort: dto.sort || 0,
      catColorStatus: 1,
    });
    return this.colorRepo.save(color);
  }

  async updateColor(id: string, dto: UpdateColorDto) {
    const color = await this.findOrFail(this.colorRepo, 'catColorId', id, 'Mau sac');

    if (dto.name !== undefined) color.catColorName = dto.name;
    if (dto.hex !== undefined) color.catColorHex = dto.hex;
    if (dto.sort !== undefined) color.catColorSort = dto.sort;
    if (dto.status !== undefined) color.catColorStatus = dto.status;

    return this.colorRepo.save(color);
  }

  async removeColor(id: string) {
    const color = await this.findOrFail(this.colorRepo, 'catColorId', id, 'Mau sac');
    return this.colorRepo.remove(color);
  }

  // --- Size Groups ---

  async findAllSizeGroups() {
    return this.sizeGroupRepo.find({ order: { catSizeGroupSort: 'ASC' } });
  }

  async createSizeGroup(dto: CreateSizeGroupDto) {
    const exists = await this.sizeGroupRepo.findOne({
      where: { catSizeGroupName: dto.name },
    });
    if (exists) throw new ConflictException('Ten nhom size da ton tai');

    const group = this.sizeGroupRepo.create({
      catSizeGroupId: randomUUID(),
      catSizeGroupName: dto.name,
      catSizeGroupValues: JSON.stringify(dto.values),
      catSizeGroupGuide: dto.guide || null,
      catSizeGroupSort: dto.sort || 0,
    });
    return this.sizeGroupRepo.save(group);
  }

  async updateSizeGroup(id: string, dto: UpdateSizeGroupDto) {
    const group = await this.findOrFail(this.sizeGroupRepo, 'catSizeGroupId', id, 'Nhom size');

    if (dto.name !== undefined) group.catSizeGroupName = dto.name;
    if (dto.values !== undefined) group.catSizeGroupValues = JSON.stringify(dto.values);
    if (dto.guide !== undefined) group.catSizeGroupGuide = dto.guide;
    if (dto.sort !== undefined) group.catSizeGroupSort = dto.sort;

    return this.sizeGroupRepo.save(group);
  }

  async removeSizeGroup(id: string) {
    const group = await this.findOrFail(this.sizeGroupRepo, 'catSizeGroupId', id, 'Nhom size');
    return this.sizeGroupRepo.remove(group);
  }

  // --- Sizes (gia tri cu the trong nhom) ---

  /** Lay tat ca size cua 1 nhom, sap xep theo sort */
  async findSizesByGroup(groupId: string) {
    return this.sizeRepo.find({
      where: { catSizeGroupId: groupId },
      order: { catSizeSort: 'ASC' },
    });
  }

  /** Lay 1 size theo id */
  async findSizeById(id: string) {
    const size = await this.sizeRepo.findOne({
      where: { catSizeId: id },
      relations: ['sizeGroup'],
    });
    if (!size) throw new NotFoundException('Size khong ton tai');
    return size;
  }

  /** Tao size moi trong nhom */
  async createSize(groupId: string, value: string, sort = 0) {
    await this.findOrFail(this.sizeGroupRepo, 'catSizeGroupId', groupId, 'Nhom size');

    const exists = await this.sizeRepo.findOne({
      where: { catSizeGroupId: groupId, catSizeValue: value },
    });
    if (exists) throw new ConflictException(`Size "${value}" da ton tai trong nhom`);

    const size = this.sizeRepo.create({
      catSizeId: randomUUID(),
      catSizeGroupId: groupId,
      catSizeValue: value,
      catSizeSort: sort,
      catSizeStatus: 1,
    });
    return this.sizeRepo.save(size);
  }

  /** Sync sizes tu JSON values cua size group — tao moi cai chua co, giu nguyen cai da co */
  async syncSizesFromGroup(groupId: string) {
    const group = await this.findOrFail(this.sizeGroupRepo, 'catSizeGroupId', groupId, 'Nhom size');

    // Parse an toan — neu JSON loi thi coi nhu danh sach rong, khong crash request
    const values: string[] = this.safeJsonParse<string[]>(
      group.catSizeGroupValues,
      [],
      `SizeGroup ${groupId}`,
    );

    const existing = await this.sizeRepo.find({ where: { catSizeGroupId: groupId } });
    const existingValues = new Set(existing.map((s) => s.catSizeValue));

    const newSizes: SizeEntity[] = [];
    for (let i = 0; i < values.length; i++) {
      if (!existingValues.has(values[i])) {
        newSizes.push(
          this.sizeRepo.create({
            catSizeId: randomUUID(),
            catSizeGroupId: groupId,
            catSizeValue: values[i],
            catSizeSort: i,
            catSizeStatus: 1,
          }),
        );
      }
    }

    if (newSizes.length > 0) {
      await this.sizeRepo.save(newSizes);
    }

    return this.sizeRepo.find({
      where: { catSizeGroupId: groupId },
      order: { catSizeSort: 'ASC' },
    });
  }

  async removeSize(id: string) {
    const size = await this.findOrFail(this.sizeRepo, 'catSizeId', id, 'Size');
    return this.sizeRepo.remove(size);
  }
}
