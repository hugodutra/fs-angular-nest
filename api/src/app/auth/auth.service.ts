import { UsersService } from '../users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import ms, { StringValue } from 'ms';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import argon2 from 'argon2';
import { LoginDto } from './dto/login.dto';
import { SafeUser } from '../types';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async validateUser(dto: LoginDto): Promise<SafeUser | null> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    if (!user) {
      return null;
    }

    const isValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isValid) {
      return null;
    }

    return this.usersService.toSafeUser(user);
  }

  async login(
    user: SafeUser
  ): Promise<{ accessToken: string; refreshToken: string; user: SafeUser }> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);

    return { accessToken, refreshToken, user };
  }

  async refresh(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string; user: SafeUser }> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        { secret: this.refreshTokenSecret }
      );

      const user = await this.usersService.findById(payload.sub);

      return this.login(user);
    } catch {
      throw new UnauthorizedException();
    }
  }

  private signAccessToken(user: SafeUser) {
    const payload = this.toPayload(user);
    return this.jwtService.signAsync(payload);
  }

  private signRefreshToken(user: SafeUser) {
    const payload = this.toPayload(user);
    return this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  private toPayload(user: SafeUser) {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }

  get refreshTokenMaxAgeMs() {
    return typeof this.refreshTokenExpiresIn === 'number'
      ? this.refreshTokenExpiresIn
      : ms(this.refreshTokenExpiresIn);
  }

  private get refreshTokenSecret() {
    return this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET');
  }

  private get refreshTokenExpiresIn(): number | StringValue {
    return this.configService.getOrThrow<number | StringValue>(
      'REFRESH_TOKEN_EXPIRES_IN'
    );
  }
}
