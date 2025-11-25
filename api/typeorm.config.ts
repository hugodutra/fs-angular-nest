import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { User } from './src/app/users/user.entity';

loadEnv();

const migrationsPath = path.join(__dirname, 'migrations', '*.{ts,js}');

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User],
  migrations: [migrationsPath],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
});
