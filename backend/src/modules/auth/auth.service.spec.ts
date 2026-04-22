import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/entities/user.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import * as passwordUtil from '@/common/utils/password.util';

// Mock password util
jest.mock('@/common/utils/password.util');
const mockedPasswordUtil = passwordUtil as jest.Mocked<typeof passwordUtil>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: Record<string, jest.Mock>;
  let refreshTokenRepo: Record<string, jest.Mock>;
  let jwtService: { sign: jest.Mock; verify: jest.Mock };
  let configService: { get: jest.Mock; getOrThrow: jest.Mock };

  const mockUser: Partial<UserEntity> = {
    sysUserId: 'user-uuid-1',
    sysUserEmail: 'admin@test.com',
    sysUserPassword: '$2b$12$hashedpassword',
    sysUserStatus: 1,
    sysUserRole: 1,
    sysUserName: 'Admin',
    sysUserAvatar: null,
    sysUserLoginCount: 5,
  };

  beforeEach(async () => {
    // Tao mock repos
    const qbMock = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    };

    userRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(qbMock),
      findOne: jest.fn(),
      update: jest.fn(),
      increment: jest.fn(),
    };

    refreshTokenRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entity) => entity),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verify: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue('test-secret'),
      getOrThrow: jest.fn().mockReturnValue('test-refresh-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(RefreshTokenEntity), useValue: refreshTokenRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('nen tra ve tokens khi email/password dung', async () => {
      const qb = userRepo.createQueryBuilder();
      qb.getOne.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePassword.mockResolvedValue(true);

      const result = await service.login({ email: 'admin@test.com', password: 'correct' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.sys_user_email).toBe('admin@test.com');
    });

    it('nen throw UnauthorizedException khi email khong ton tai', async () => {
      const qb = userRepo.createQueryBuilder();
      qb.getOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@test.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('nen throw ForbiddenException khi tai khoan bi khoa', async () => {
      const qb = userRepo.createQueryBuilder();
      qb.getOne.mockResolvedValue({ ...mockUser, sysUserStatus: 0 });

      await expect(
        service.login({ email: 'admin@test.com', password: 'any' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('nen throw UnauthorizedException khi password sai', async () => {
      const qb = userRepo.createQueryBuilder();
      qb.getOne.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePassword.mockResolvedValue(false);

      await expect(
        service.login({ email: 'admin@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('nen throw UnauthorizedException khi role = 0 (customer)', async () => {
      const qb = userRepo.createQueryBuilder();
      qb.getOne.mockResolvedValue({ ...mockUser, sysUserRole: 0 });

      await expect(
        service.login({ email: 'customer@test.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('nen revoke tat ca refresh tokens cua user', async () => {
      await service.logout('user-uuid-1');

      expect(refreshTokenRepo.update).toHaveBeenCalledWith(
        { sysUserId: 'user-uuid-1', sysRefreshTokenRevoked: 0 },
        { sysRefreshTokenRevoked: 1 },
      );
    });
  });

  describe('getMe', () => {
    it('nen tra ve user info + permissions', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.getMe('user-uuid-1');

      expect(result.sys_user_id).toBe('user-uuid-1');
      expect(result).toHaveProperty('permissions');
    });

    it('nen throw khi user khong ton tai', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.getMe('non-existent')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('nen throw khi mat khau hien tai sai', async () => {
      const qb = userRepo.createQueryBuilder();
      qb.getOne.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePassword.mockResolvedValue(false);

      await expect(
        service.changePassword('user-uuid-1', {
          currentPassword: 'wrong',
          newPassword: 'newPass123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('nen doi mat khau va revoke tokens khi thanh cong', async () => {
      const qb = userRepo.createQueryBuilder();
      qb.getOne.mockResolvedValue(mockUser);
      mockedPasswordUtil.comparePassword.mockResolvedValue(true);
      mockedPasswordUtil.hashPassword.mockResolvedValue('$2b$12$newhash');

      await service.changePassword('user-uuid-1', {
        currentPassword: 'correct',
        newPassword: 'newPass123',
      });

      expect(userRepo.update).toHaveBeenCalledWith('user-uuid-1', { sysUserPassword: '$2b$12$newhash' });
      // Verify logout (revoke tokens) duoc goi
      expect(refreshTokenRepo.update).toHaveBeenCalled();
    });
  });
});
