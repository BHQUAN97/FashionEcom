import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ColorEntity } from './entities/color.entity';
import { SizeGroupEntity } from './entities/size-group.entity';
import { CreateColorDto, UpdateColorDto } from './dto/create-color.dto';
import { CreateSizeGroupDto, UpdateSizeGroupDto } from './dto/create-size-group.dto';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(ColorEntity)
    private readonly colorRepo: Repository<ColorEntity>,
    @InjectRepository(SizeGroupEntity)
    private readonly sizeGroupRepo: Repository<SizeGroupEntity>,
  ) {}

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
      catColorId: uuidv4(),
      catColorName: dto.name,
      catColorHex: dto.hex,
      catColorSort: dto.sort || 0,
      catColorStatus: 1,
    });
    return this.colorRepo.save(color);
  }

  async updateColor(id: string, dto: UpdateColorDto) {
    const color = await this.colorRepo.findOne({ where: { catColorId: id } });
    if (!color) throw new NotFoundException('Mau sac khong ton tai');

    if (dto.name !== undefined) color.catColorName = dto.name;
    if (dto.hex !== undefined) color.catColorHex = dto.hex;
    if (dto.sort !== undefined) color.catColorSort = dto.sort;
    if (dto.status !== undefined) color.catColorStatus = dto.status;

    return this.colorRepo.save(color);
  }

  async removeColor(id: string) {
    const color = await this.colorRepo.findOne({ where: { catColorId: id } });
    if (!color) throw new NotFoundException('Mau sac khong ton tai');
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
      catSizeGroupId: uuidv4(),
      catSizeGroupName: dto.name,
      catSizeGroupValues: JSON.stringify(dto.values),
      catSizeGroupGuide: dto.guide || null,
      catSizeGroupSort: dto.sort || 0,
    });
    return this.sizeGroupRepo.save(group);
  }

  async updateSizeGroup(id: string, dto: UpdateSizeGroupDto) {
    const group = await this.sizeGroupRepo.findOne({ where: { catSizeGroupId: id } });
    if (!group) throw new NotFoundException('Nhom size khong ton tai');

    if (dto.name !== undefined) group.catSizeGroupName = dto.name;
    if (dto.values !== undefined) group.catSizeGroupValues = JSON.stringify(dto.values);
    if (dto.guide !== undefined) group.catSizeGroupGuide = dto.guide;
    if (dto.sort !== undefined) group.catSizeGroupSort = dto.sort;

    return this.sizeGroupRepo.save(group);
  }

  async removeSizeGroup(id: string) {
    const group = await this.sizeGroupRepo.findOne({ where: { catSizeGroupId: id } });
    if (!group) throw new NotFoundException('Nhom size khong ton tai');
    return this.sizeGroupRepo.remove(group);
  }
}
