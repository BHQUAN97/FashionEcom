import { randomUUID, createHash } from 'crypto';
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  Logger,
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
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenEntity>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Đăng nhập admin — verify email/password, trả JWT tokens
   */
  async login(dto: LoginDto) {
    // Tim user theo email, select password (bi exclude mac dinh)
    const user = await this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.sysUserPassword')
      .where('u.sysUserEmail = :email', { email: dto.email })
      .getOne();

    if (!user) {
      this.logger.warn(`[SECURITY] Login failed — email not found: ${dto.email}`);
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Kiem tra tai khoan active
    if (user.sysUserStatus !== 1) {
      this.logger.warn(`[SECURITY] Login blocked — account locked: ${dto.email}`);
      throw new ForbiddenException('Tài khoản đã bị khóa');
    }

    // Kiem tra role admin (khong cho customer dang nhap admin)
    if (user.sysUserRole === 0) {
      this.logger.warn(`[SECURITY] Login blocked — customer tried admin login: ${dto.email}`);
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Verify password
    const isValid = await comparePassword(dto.password, user.sysUserPassword);
    if (!isValid) {
      this.logger.warn(`[SECURITY] Login failed — wrong password: ${dto.email}`);
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // Cap nhat last_login va login_count
    await this.userRepo.update(user.sysUserId, {
      sysUserLastLogin: new Date(),
      sysUserLoginCount: () => 'sys_user_login_count + 1',
    } as unknown as Partial<UserEntity>);

    this.logger.log(`[AUDIT] Login success: ${user.sysUserEmail}, role=${user.sysUserRole}`);

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
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token type không hợp lệ');
    }

    // Tim refresh token trong DB theo hash — verify chinh xac token nao duoc su dung
    const tokenHash = this.hashToken(refreshToken);
    const tokenRecord = await this.refreshTokenRepo.findOne({
      where: {
        sysUserId: payload.sub,
        sysRefreshTokenHash: tokenHash,
        sysRefreshTokenRevoked: 0,
        sysRefreshTokenExpires: MoreThan(new Date()),
      },
    });

    if (!tokenRecord) {
      // Co the la token bi danh cap → revoke TAT CA tokens cua user (defense in depth)
      this.logger.error(
        `[SECURITY] Possible token theft detected! userId=${payload.sub} — revoking ALL sessions`,
      );
      await this.refreshTokenRepo.update(
        { sysUserId: payload.sub, sysRefreshTokenRevoked: 0 },
        { sysRefreshTokenRevoked: 1 },
      );
      throw new UnauthorizedException('Refresh token không hợp lệ — tất cả phiên đã bị thu hồi');
    }

    // Revoke token cu
    await this.refreshTokenRepo.update(tokenRecord.sysRefreshTokenId, {
      sysRefreshTokenRevoked: 1,
    });

    // Tim user
    const user = await this.userRepo.findOne({ where: { sysUserId: payload.sub } });
    if (!user || user.sysUserStatus !== 1) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị khóa');
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
    if (!user) throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');

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
   * Đổi mật khẩu — verify current, hash new
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.sysUserPassword')
      .where('u.sysUserId = :id', { id: userId })
      .getOne();

    if (!user) throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');

    const isValid = await comparePassword(dto.currentPassword, user.sysUserPassword);
    if (!isValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    const hashed = await hashPassword(dto.newPassword);
    await this.userRepo.update(userId, { sysUserPassword: hashed });

    this.logger.warn(`[AUDIT] Password changed: userId=${userId}`);

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
      sysRefreshTokenHash: this.hashToken(refreshToken), // SHA256 hash toan bo token
      sysRefreshTokenExpires: expiresAt,
      sysRefreshTokenRevoked: 0,
    });
    await this.refreshTokenRepo.save(tokenEntity);

    return { accessToken, refreshToken };
  }

  /** Hash token bang SHA256 — dung cho luu va verify refresh token */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
