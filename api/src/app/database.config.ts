import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfigFactory = (
  config: ConfigService
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.getOrThrow<string>('DB_HOST'),
  port: config.getOrThrow<number>('DB_PORT'),
  username: config.getOrThrow<string>('DB_USER'),
  password: config.getOrThrow<string>('DB_PASS'),
  database: config.getOrThrow<string>('DB_NAME'),
  autoLoadEntities: true,
  // Migrations manage schema; disable auto sync to avoid drift in production.
  synchronize: false,
  logging: config.get<string>('NODE_ENV') !== 'production',
});
