import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
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
   * Cap nhat settings theo group — upsert tung key
   */
  async updateByGroup(group: string, data: Record<string, string>) {
    for (const [key, value] of Object.entries(data)) {
      const existing = await this.settingRepo.findOne({
        where: { sysSettingGroup: group, sysSettingKey: key },
      });

      if (existing) {
        existing.sysSettingValue = value;
        existing.modifiedDate = new Date();
        await this.settingRepo.save(existing);
      } else {
        const setting = this.settingRepo.create({
          sysSettingId: uuidv4(),
          sysSettingGroup: group,
          sysSettingKey: key,
          sysSettingValue: value,
        });
        await this.settingRepo.save(setting);
      }
    }

    return this.getByGroup(group);
  }
}
