import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { LoyaltyConfigEntity } from './entities/loyalty-config.entity';
import { LoyaltyTransactionEntity } from './entities/loyalty-transaction.entity';
import { RedeemPointsDto, AdjustPointsDto, UpdateLoyaltyConfigDto } from './dto/loyalty.dto';
import { BaseService } from '@/common/services/base.service';

/** Phan hang loyalty */
export enum LoyaltyTier { MEMBER = 'Member', SILVER = 'Silver', GOLD = 'Gold', PLATINUM = 'Platinum' }
const TIER_MULTIPLIERS: Record<string, number> = {
  Member: 0, Silver: 0.10, Gold: 0.20, Platinum: 0.30,
};

@Injectable()
export class LoyaltyService extends BaseService<LoyaltyTransactionEntity> {
  constructor(
    @InjectRepository(LoyaltyConfigEntity)
    private readonly configRepo: Repository<LoyaltyConfigEntity>,
    @InjectRepository(LoyaltyTransactionEntity)
    private readonly transRepo: Repository<LoyaltyTransactionEntity>,
  ) {
    super(transRepo, 'prmLoyaltyTransactionId', 'Diem thuong');
  }

  /** Lay config hien tai */
  async getConfig(): Promise<LoyaltyConfigEntity> {
    const configs = await this.configRepo.find({ take: 1 });
    if (configs.length === 0) throw new NotFoundException('Chua co cau hinh loyalty');
    return configs[0];
  }

  /** Cap nhat config */
  async updateConfig(dto: UpdateLoyaltyConfigDto) {
    const config = await this.getConfig();
    if (dto.earnRate !== undefined) config.prmLoyaltyConfigEarnRate = dto.earnRate;
    if (dto.redeemRate !== undefined) config.prmLoyaltyConfigRedeemRate = dto.redeemRate;
    if (dto.maxRedeemPercent !== undefined) config.prmLoyaltyConfigMaxRedeemPercent = dto.maxRedeemPercent;
    if (dto.minRedeemPoints !== undefined) config.prmLoyaltyConfigMinRedeemPoints = dto.minRedeemPoints;
    if (dto.expiryMonths !== undefined) config.prmLoyaltyConfigExpiryMonths = dto.expiryMonths;
    if (dto.pendingDays !== undefined) config.prmLoyaltyConfigPendingDays = dto.pendingDays;
    if (dto.silverThreshold !== undefined) config.prmLoyaltyConfigSilverThreshold = dto.silverThreshold;
    if (dto.goldThreshold !== undefined) config.prmLoyaltyConfigGoldThreshold = dto.goldThreshold;
    if (dto.platinumThreshold !== undefined) config.prmLoyaltyConfigPlatinumThreshold = dto.platinumThreshold;
    return this.configRepo.save(config);
  }

  /** Tinh so du diem hien tai cua KH */
  async getBalance(customerId: string) {
    const config = await this.getConfig();

    // Tinh tong diem tu lich su giao dich
    const result = await this.transRepo
      .createQueryBuilder('t')
      .select('SUM(t.prmLoyaltyTransactionPoints)', 'total')
      .where('t.sysCustomerId = :cid', { cid: customerId })
      .getRawOne();

    const currentPoints = Number(result?.total || 0);

    // Tinh diem pending (earn chua qua pending_days)
    const pendingDate = new Date();
    pendingDate.setDate(pendingDate.getDate() - Number(config.prmLoyaltyConfigPendingDays));

    const pendingResult = await this.transRepo
      .createQueryBuilder('t')
      .select('SUM(t.prmLoyaltyTransactionPoints)', 'total')
      .where('t.sysCustomerId = :cid', { cid: customerId })
      .andWhere('t.prmLoyaltyTransactionType = 0') // Earn
      .andWhere('t.createdDate > :pd', { pd: pendingDate })
      .getRawOne();

    const pendingPoints = Number(pendingResult?.total || 0);

    // Tinh diem sap het han (30 ngay toi)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const expiringResult = await this.transRepo
      .createQueryBuilder('t')
      .select('SUM(t.prmLoyaltyTransactionPoints)', 'total')
      .where('t.sysCustomerId = :cid', { cid: customerId })
      .andWhere('t.prmLoyaltyTransactionType = 0')
      .andWhere('t.prmLoyaltyTransactionExpiresAt <= :ed', { ed: expiryDate })
      .andWhere('t.prmLoyaltyTransactionExpiresAt > NOW()')
      .getRawOne();

    // Xac dinh tier
    const tier = await this.evaluateTier(customerId, config);

    return {
      currentPoints,
      pendingPoints,
      tier: tier.name,
      tierProgress: tier.progress,
      pointsExpiringSoon: Number(expiringResult?.total || 0),
    };
  }

  /**
   * Tich diem khi don hang hoan thanh — goi tu order completed event
   */
  async earnPoints(customerId: string, orderId: string, eligibleAmount: number) {
    const config = await this.getConfig();
    const earnRate = Number(config.prmLoyaltyConfigEarnRate);
    const expiryMonths = Number(config.prmLoyaltyConfigExpiryMonths);

    // Tinh diem
    const basePoints = Math.floor(eligibleAmount / earnRate);
    if (basePoints <= 0) return null;

    // Lay tier hien tai de tinh bonus
    const tier = await this.evaluateTier(customerId, config);
    const multiplier = TIER_MULTIPLIERS[tier.name] || 0;
    const tierBonus = Math.floor(basePoints * multiplier);
    const totalPoints = basePoints + tierBonus;

    // Ngay het han
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + expiryMonths);

    // Lay balance hien tai
    const balance = await this.getCurrentBalance(customerId);

    const transaction = this.transRepo.create({
      prmLoyaltyTransactionId: randomUUID(),
      sysCustomerId: customerId,
      prmLoyaltyTransactionType: 0, // Earn
      prmLoyaltyTransactionPoints: totalPoints,
      prmLoyaltyTransactionBalance: balance + totalPoints,
      prmLoyaltyTransactionRefType: 'order',
      prmLoyaltyTransactionRefId: orderId,
      prmLoyaltyTransactionDescription: `Tich ${totalPoints} diem tu don hang (${basePoints} co ban + ${tierBonus} bonus ${tier.name})`,
      prmLoyaltyTransactionExpiresAt: expiresAt,
    });
    return this.transRepo.save(transaction);
  }

  /**
   * Doi diem tai checkout
   */
  async redeem(dto: RedeemPointsDto, customerId: string) {
    const config = await this.getConfig();
    const minPoints = Number(config.prmLoyaltyConfigMinRedeemPoints);
    const redeemRate = Number(config.prmLoyaltyConfigRedeemRate);

    if (dto.points < minPoints) {
      throw new BadRequestException(`So diem toi thieu de doi la ${minPoints}`);
    }

    const balance = await this.getCurrentBalance(customerId);
    if (balance < dto.points) {
      throw new BadRequestException('Khong du diem de doi');
    }

    // Tinh gia tri giam gia: 100 diem = 10,000 VND
    const discountAmount = (dto.points / redeemRate) * 10000;

    const transaction = this.transRepo.create({
      prmLoyaltyTransactionId: randomUUID(),
      sysCustomerId: customerId,
      prmLoyaltyTransactionType: 1, // Redeem
      prmLoyaltyTransactionPoints: -dto.points,
      prmLoyaltyTransactionBalance: balance - dto.points,
      prmLoyaltyTransactionRefType: 'order',
      prmLoyaltyTransactionRefId: dto.orderId,
      prmLoyaltyTransactionDescription: `Doi ${dto.points} diem = ${discountAmount.toLocaleString('vi-VN')} VND`,
    });
    await this.transRepo.save(transaction);

    return {
      discountAmount,
      remainingPoints: balance - dto.points,
    };
  }

  /** Dieu chinh diem thu cong — admin */
  async adjustPoints(dto: AdjustPointsDto, adminId: string) {
    const balance = await this.getCurrentBalance(dto.customerId);

    const transaction = this.transRepo.create({
      prmLoyaltyTransactionId: randomUUID(),
      sysCustomerId: dto.customerId,
      prmLoyaltyTransactionType: 4, // Adjust
      prmLoyaltyTransactionPoints: dto.points,
      prmLoyaltyTransactionBalance: balance + dto.points,
      prmLoyaltyTransactionRefType: 'admin_adjust',
      prmLoyaltyTransactionRefId: adminId,
      prmLoyaltyTransactionDescription: dto.description || `Dieu chinh ${dto.points > 0 ? '+' : ''}${dto.points} diem boi admin`,
    });
    return this.transRepo.save(transaction);
  }

  /** Lich su giao dich */
  async getTransactions(customerId: string, page = 1, limit = 20) {
    const total = await this.transRepo.count({ where: { sysCustomerId: customerId } });
    const data = await this.transRepo.find({
      where: { sysCustomerId: customerId },
      order: { createdDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return this.paginate(data, total, page, limit);
  }

  /** Admin: list all transactions */
  async getAllTransactions(page = 1, limit = 20) {
    const total = await this.transRepo.count();
    const data = await this.transRepo.find({
      order: { createdDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return this.paginate(data, total, page, limit);
  }

  /** Cron: xoa diem het han */
  async expirePoints() {
    const now = new Date();
    // Tim diem earn chua het han truoc do, nhung gio da het
    const expired = await this.transRepo.find({
      where: {
        prmLoyaltyTransactionType: 0,
        prmLoyaltyTransactionExpiresAt: LessThanOrEqual(now),
      },
    });
    // De don gian, tao transaction expire cho moi customer co diem het han
    // Thuc te se can logic phuc tap hon de tinh chinh xac so diem het han
    return { processed: expired.length };
  }

  // ==================== Helper ====================

  private async getCurrentBalance(customerId: string): Promise<number> {
    const result = await this.transRepo
      .createQueryBuilder('t')
      .select('SUM(t.prmLoyaltyTransactionPoints)', 'total')
      .where('t.sysCustomerId = :cid', { cid: customerId })
      .getRawOne();
    return Number(result?.total || 0);
  }

  private async evaluateTier(customerId: string, config: LoyaltyConfigEntity) {
    // Tinh tong chi tieu 12 thang — can join voi orders, de don gian tra ve Member
    const silver = Number(config.prmLoyaltyConfigSilverThreshold);
    const gold = Number(config.prmLoyaltyConfigGoldThreshold);
    const platinum = Number(config.prmLoyaltyConfigPlatinumThreshold);

    // TODO: Query tong tien don hang 12 thang gan nhat cua KH
    const spend12m = 0; // placeholder

    let name = LoyaltyTier.MEMBER;
    let nextTier = LoyaltyTier.SILVER;
    let nextThreshold = silver;

    if (spend12m >= platinum) {
      name = LoyaltyTier.PLATINUM;
      nextTier = LoyaltyTier.PLATINUM;
      nextThreshold = platinum;
    } else if (spend12m >= gold) {
      name = LoyaltyTier.GOLD;
      nextTier = LoyaltyTier.PLATINUM;
      nextThreshold = platinum;
    } else if (spend12m >= silver) {
      name = LoyaltyTier.SILVER;
      nextTier = LoyaltyTier.GOLD;
      nextThreshold = gold;
    }

    return {
      name,
      progress: {
        currentSpend12m: spend12m,
        nextTier,
        nextTierThreshold: nextThreshold,
        progressPercent: nextThreshold > 0 ? Math.min(100, Math.round((spend12m / nextThreshold) * 100)) : 100,
      },
    };
  }
}
