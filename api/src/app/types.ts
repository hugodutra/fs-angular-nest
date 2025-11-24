import { User } from './users/user.entity';
export type SafeUser = Omit<User, 'passwordHash'>;
