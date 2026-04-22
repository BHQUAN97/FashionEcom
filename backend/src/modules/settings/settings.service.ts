import { randomUUID } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingEntity } from './entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingEntity)
    private readonly settingRepo: Repository<SettingEntity>,
  ) {}

  /**
   * Lay tat ca settings theo group
   */
  async getByGroup(group: string) {
    const settings = await this.settingRepo.find({
      where: { sysSettingGroup: group },
    });
    // Tra ve dang key-value map
    const result: Record<string, string | null> = {};
    settings.forEach((s) => {
      result[s.sysSettingKey] = s.sysSettingValue;
    });
    return result;
  }

  /**
   * Lay tat ca settings
   */
  async getAll() {
    const settings = await this.settingRepo.find();
    const grouped: Record<string, Record<string, string | null>> = {};
    settings.forEach((s) => {
      if (!grouped[s.sysSettingGroup]) grouped[s.sysSettingGroup] = {};
      grouped[s.sysSettingGroup][s.sysSettingKey] = s.sysSettingValue;
    });
    return grouped;
  }

  /**
   * Cap nhat settings theo group — upsert batch, chi 2 query thay vi 2*N
   */
  async updateByGroup(group: string, data: Record<string, string>) {
    const keys = Object.keys(data);
    if (keys.length === 0) return this.getByGroup(group);

    // Query batch: lay tat ca settings da ton tai trong group theo keys
    const existing = await this.settingRepo
      .createQueryBuilder('s')
      .where('s.sysSettingGroup = :group', { group })
      .andWhere('s.sysSettingKey IN (:...keys)', { keys })
      .getMany();
    const existingMap = new Map(existing.map((s) => [s.sysSettingKey, s]));

    const now = new Date();
    const toSave: SettingEntity[] = [];

    for (const [key, value] of Object.entries(data)) {
      const found = existingMap.get(key);
      if (found) {
        found.sysSettingValue = value;
        found.modifiedDate = now;
        toSave.push(found);
      } else {
        toSave.push(
          this.settingRepo.create({
            sysSettingId: randomUUID(),
            sysSettingGroup: group,
            sysSettingKey: key,
            sysSettingValue: value,
          }),
        );
      }
    }

    // 1 query save batch
    await this.settingRepo.save(toSave);
    return this.getByGroup(group);
  }
}
