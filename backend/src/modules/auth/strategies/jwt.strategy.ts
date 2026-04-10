import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

export interface JwtPayload {
  sub: string; // sys_user_id
  email: string;
  role: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', 'dev-secret-change-me'),
    });
  }

  /**
   * Validate JWT payload — kiem tra user ton tai va active
   */
  async validate(payload: JwtPayload) {
    const user = await this.userRepo.findOne({
      where: { sysUserId: payload.sub, sysUserStatus: 1 },
    });
    if (!user) {
      throw new UnauthorizedException('Tai khoan khong ton tai hoac da bi khoa');
    }
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
