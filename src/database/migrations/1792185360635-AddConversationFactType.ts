import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConversationFactType1792185360635 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "conversation_facts"
      ADD COLUMN "type" varchar(20)
      NOT NULL DEFAULT 'long_term'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "conversation_facts"
      DROP COLUMN "type"
    `);
  }
}
