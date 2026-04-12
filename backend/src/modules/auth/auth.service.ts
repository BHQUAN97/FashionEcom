import { randomUUID } from 'crypto';
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../users/entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { comparePassword, hashPassword } from '@/common/utils/password.util';
import { PERMISSION_MATRIX } from '@/common/constants/permissions.constant';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenEntity>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Dang nhap admin — verify email/password, tra JWT tokens
   */
  async login(dto: LoginDto) {
    // Tim user theo email, select password (bi exclude mac dinh)
    const user = await this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.sysUserPassword')
      .where('u.sysUserEmail = :email', { email: dto.email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Email hoac mat khau khong dung');
    }

    // Kiem tra tai khoan active
    if (user.sysUserStatus !== 1) {
      throw new ForbiddenException('Tai khoan da bi khoa');
    }

    // Kiem tra role admin (khong cho customer dang nhap admin)
    if (user.sysUserRole === 0) {
      throw new UnauthorizedException('Email hoac mat khau khong dung');
    }

    // Verify password
    const isValid = await comparePassword(dto.password, user.sysUserPassword);
    if (!isValid) {
      throw new UnauthorizedException('Email hoac mat khau khong dung');
    }

    // Cap nhat last_login va login_count
    await this.userRepo.update(user.sysUserId, {
      sysUserLastLogin: new Date(),
      sysUserLoginCount: () => 'sys_user_login_count + 1',
    } as unknown as Partial<UserEntity>);

    // Tao token pair
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: {
        sys_user_id: user.sysUserId,
        sys_user_email: user.sysUserEmail,
        sys_user_role: user.sysUserRole,
        sys_user_name: user.sysUserName,
        sys_user_avatar: user.sysUserAvatar,
      },
    };
  }

  /**
   * Refresh token rotation — revoke cu, tao moi
   */
  async refresh(refreshToken: string) {
    // Verify JWT refresh token
    let payload: { sub: string; type: string };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token khong hop le');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token type khong hop le');
    }

    // Tim refresh token trong DB (chua revoke, chua het han)
    const tokenRecord = await this.refreshTokenRepo.findOne({
      where: {
        sysUserId: payload.sub,
        sysRefreshTokenRevoked: 0,
        sysRefreshTokenExpires: MoreThan(new Date()),
      },
      order: { createdDate: 'DESC' },
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token da het han hoac da bi thu hoi');
    }

    // Revoke token cu
    await this.refreshTokenRepo.update(tokenRecord.sysRefreshTokenId, {
      sysRefreshTokenRevoked: 1,
    });

    // Tim user
    const user = await this.userRepo.findOne({ where: { sysUserId: payload.sub } });
    if (!user || user.sysUserStatus !== 1) {
      throw new UnauthorizedException('Tai khoan khong ton tai hoac da bi khoa');
    }

    // Tao token pair moi
    return this.generateTokens(user);
  }

  /**
   * Logout — revoke tat ca refresh tokens cua user
   */
  async logout(userId: string) {
    await this.refreshTokenRepo.update(
      { sysUserId: userId, sysRefreshTokenRevoked: 0 },
      { sysRefreshTokenRevoked: 1 },
    );
  }

  /**
   * Get current user info + permissions
   */
  async getMe(userId: string) {
    const user = await this.userRepo.findOne({ where: { sysUserId: userId } });
    if (!user) throw new UnauthorizedException('User khong ton tai');

    const permissions = PERMISSION_MATRIX[user.sysUserRole] || [];

    return {
      sys_user_id: user.sysUserId,
      sys_user_email: user.sysUserEmail,
      sys_user_role: user.sysUserRole,
      sys_user_name: user.sysUserName,
      sys_user_avatar: user.sysUserAvatar,
      permissions,
    };
  }

  /**
   * Doi mat khau — verify current, hash new
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.sysUserPassword')
      .where('u.sysUserId = :id', { id: userId })
      .getOne();

    if (!user) throw new UnauthorizedException('User khong ton tai');

    const isValid = await comparePassword(dto.currentPassword, user.sysUserPassword);
    if (!isValid) {
      throw new BadRequestException('Mat khau hien tai khong dung');
    }

    const hashed = await hashPassword(dto.newPassword);
    await this.userRepo.update(userId, { sysUserPassword: hashed });

    // Revoke tat ca refresh tokens sau khi doi mat khau
    await this.logout(userId);
  }

  /**
   * Tao access token + refresh token, luu refresh token vao DB
   */
  private async generateTokens(user: UserEntity) {
    const accessPayload = {
      sub: user.sysUserId,
      email: user.sysUserEmail,
      role: user.sysUserRole,
    };

    const refreshPayload = {
      sub: user.sysUserId,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessPayload);
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Luu refresh token vao DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const tokenEntity = this.refreshTokenRepo.create({
      sysRefreshTokenId: randomUUID(),
      sysUserId: user.sysUserId,
      sysRefreshTokenHash: refreshToken.slice(-32), // Luu 32 ky tu cuoi de doi chieu
      sysRefreshTokenExpires: expiresAt,
      sysRefreshTokenRevoked: 0,
    });
    await this.refreshTokenRepo.save(tokenEntity);

    return { accessToken, refreshToken };
  }
}
