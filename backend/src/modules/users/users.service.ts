import { randomUUID } from 'crypto';
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '@/common/utils/password.util';
import { UserRole } from '@/common/constants/roles.constant';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { BaseService } from '@/common/services/base.service';

@Injectable()
export class UsersService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {
    super(userRepo, 'sysUserId', 'Nguoi dung');
  }

  /**
   * Danh sach admin users (loai bo customer role)
   */
  async findAll(query: PaginationDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.userRepo.createQueryBuilder('u')
      .where('u.sysUserRole > 0'); // Chi lay admin users

    if (query.search) {
      qb.andWhere('(u.sysUserEmail LIKE :s OR u.sysUserName LIKE :s)', {
        s: `%${query.search}%`,
      });
    }

    const sortField = query.sort || 'createdDate';
    const sortOrder = query.order || 'DESC';
    qb.orderBy(`u.${sortField}`, sortOrder);

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    return this.paginate(data, total, page, limit);
  }

  /**
   * Tao admin user moi
   */
  async create(dto: CreateUserDto) {
    // Check unique email
    const existing = await this.userRepo.findOne({
      where: { sysUserEmail: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email da ton tai');
    }

    const hashed = await hashPassword(dto.password);
    const user = this.userRepo.create({
      sysUserId: randomUUID(),
      sysUserEmail: dto.email,
      sysUserPassword: hashed,
      sysUserRole: dto.role,
      sysUserName: dto.name || null,
      sysUserStatus: 1,
    });

    const saved = await this.userRepo.save(user);
    // Khong tra password
    const { sysUserPassword: _, ...result } = saved as any;
    return result;
  }

  /**
   * Cap nhat admin user
   */
  async update(id: string, dto: UpdateUserDto, currentUserRole: number) {
    const user = await this.userRepo.findOne({ where: { sysUserId: id } });
    if (!user) throw new NotFoundException('User khong ton tai');

    // Chi super_admin moi duoc sua super_admin khac
    if (user.sysUserRole === UserRole.SUPER_ADMIN && currentUserRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Khong co quyen sua Super Admin');
    }

    if (dto.name !== undefined) user.sysUserName = dto.name;
    if (dto.role !== undefined) user.sysUserRole = dto.role;
    if (dto.status !== undefined) user.sysUserStatus = dto.status;
    if (dto.avatar !== undefined) user.sysUserAvatar = dto.avatar;

    return this.userRepo.save(user);
  }

  /**
   * Xoa (soft delete — set status = 0)
   */
  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ForbiddenException('Khong the xoa chinh minh');
    }
    const user = await this.userRepo.findOne({ where: { sysUserId: id } });
    if (!user) throw new NotFoundException('User khong ton tai');

    user.sysUserStatus = 0;
    return this.userRepo.save(user);
  }

  /**
   * Tim user theo ID — ke thua tu BaseService
   */
  async findById(id: string) {
    return super.findOne(id);
  }
}
