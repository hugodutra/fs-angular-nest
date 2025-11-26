import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Seeds an initial admin user for local/dev usage.
 * Password: Admin123! (argon2id hash below). Change after first login if desired.
 */
export class SeedAdminUser1764179001000 implements MigrationInterface {
  name = 'SeedAdminUser1764179001000';

  private readonly adminEmail = 'admin@email.com';
  private readonly adminHash =
    '$argon2id$v=19$m=65536,t=3,p=4$QyGfMJsBkbT30/B2JNPzJw$PEhqzleRP91Ywk5SkNowr9e3Hi5NBGyKao4NLtoRtO4';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO "users" ("email", "name", "firstName", "lastName", "role", "passwordHash", "isActive")
      VALUES ($1, $2, $3, $4, 'admin', $5, true)
      ON CONFLICT ("email") DO NOTHING
    `,
      [this.adminEmail, 'Admin User', 'Admin', 'User', this.adminHash]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "users" WHERE email = $1`, [
      this.adminEmail,
    ]);
  }
}
