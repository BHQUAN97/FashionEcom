import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { GuideTourEntity, GuideTourCompletionEntity } from './entities/guide-tour.entity';

@Injectable()
export class GuidesService {
  constructor(
    @InjectRepository(GuideTourEntity)
    private readonly guideRepo: Repository<GuideTourEntity>,
    @InjectRepository(GuideTourCompletionEntity)
    private readonly completionRepo: Repository<GuideTourCompletionEntity>,
  ) {}

  /** Lay guide cho 1 man hinh — kiem tra role + chua hoan thanh */
  async getGuide(screenId: string, userId: string, userRole: number) {
    const guide = await this.guideRepo.findOne({
      where: { sysGuideTourScreenId: screenId, sysGuideTourStatus: 1 },
    });
    if (!guide) return null;

    // Kiem tra role
    if (!guide.sysGuideTourRoles.includes(userRole)) return null;

    // Kiem tra da hoan thanh chua
    const completed = await this.completionRepo.findOne({
      where: { sysUserId: userId, sysGuideTourScreenId: screenId },
    });
    if (completed) return null;

    return guide;
  }

  /** Danh dau da xem guide */
  async complete(screenId: string, userId: string) {
    const existing = await this.completionRepo.findOne({
      where: { sysUserId: userId, sysGuideTourScreenId: screenId },
    });
    if (existing) return existing;

    const completion = this.completionRepo.create({
      sysGuideTourCompletionId: uuidv4(),
      sysUserId: userId,
      sysGuideTourScreenId: screenId,
    });
    return this.completionRepo.save(completion);
  }

  /** Admin: list all guides */
  async findAll() {
    return this.guideRepo.find({ order: { sysGuideTourScreenId: 'ASC' } });
  }

  /** Admin: update guide content */
  async update(screenId: string, data: {
    title?: string;
    roles?: number[];
    steps?: { title: string; description: string; selector: string; position?: string }[];
    status?: number;
  }) {
    let guide = await this.guideRepo.findOne({
      where: { sysGuideTourScreenId: screenId },
    });

    if (!guide) {
      guide = this.guideRepo.create({
        sysGuideTourId: uuidv4(),
        sysGuideTourScreenId: screenId,
        sysGuideTourTitle: data.title || screenId,
        sysGuideTourRoles: data.roles || [1, 2, 3, 4, 5, 6],
        sysGuideTourSteps: data.steps || [],
        sysGuideTourStatus: data.status ?? 1,
      });
    } else {
      if (data.title) guide.sysGuideTourTitle = data.title;
      if (data.roles) guide.sysGuideTourRoles = data.roles;
      if (data.steps) guide.sysGuideTourSteps = data.steps;
      if (data.status !== undefined) guide.sysGuideTourStatus = data.status;
    }

    return this.guideRepo.save(guide);
  }
}
