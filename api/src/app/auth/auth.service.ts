import { UsersService } from '../users/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import argon2 from 'argon2';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';

type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
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

  async login(user: SafeUser): Promise<{ accesstToken: string }> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const token = await this.jwtService.signAsync(payload);
    return { accesstToken: token };
  }
}
