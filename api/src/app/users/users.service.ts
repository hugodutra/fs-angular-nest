import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import argon2 from 'argon2';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './user.entity';

type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) {}

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const email = dto.email.toLowerCase();
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const role: UserRole = dto.role ?? 'user';

    const user = this.usersRepository.create({
      email,
      name: dto.name,
      role,
      passwordHash,
    });

    const saved = await this.usersRepository.save(user);
    return this.toSafeUser(saved);
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.usersRepository.find();
    return users.map((user) => this.toSafeUser(user));
  }

  async findById(id: string): Promise<SafeUser> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toSafeUser(user);
  }

  async findByEmailWithPassword(email: string): Promise<User | undefined> {
    const normalizedEmail = email.toLowerCase();
    const user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    console.log({ user });

    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email) {
      const email = dto.email.toLowerCase();
      if (email !== user.email) {
        const existing = await this.usersRepository.findOne({
          where: { email },
        });
        if (existing) {
          throw new ConflictException('Email already in use');
        }
      }
      user.email = email;
    }

    if (dto.name) {
      user.name = dto.name;
    }

    if (dto.role) {
      user.role = dto.role;
    }

    if (dto.password) {
      user.passwordHash = await this.hashPassword(dto.password);
    }

    const saved = await this.usersRepository.save(user);
    return this.toSafeUser(saved);
  }

  public toSafeUser(user: User): SafeUser {
    // Strip password hash before returning to controllers/clients.
    const { passwordHash, ...rest } = user;
    return rest;
  }

  private hashPassword(password: string) {
    return argon2.hash(password, { type: argon2.argon2id });
  }
}
