import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessageSequence1791670816726 implements MigrationInterface {
  name = 'AddMessageSequence1791670816726';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chat_messages"
      ADD COLUMN "sequence" integer
    `);

    await queryRunner.query(`
      WITH ordered_messages AS (
        SELECT
          "id",
          ROW_NUMBER() OVER (
            PARTITION BY "chatId"
            ORDER BY "createdAt" ASC, "id" ASC
          ) AS row_num
        FROM "chat_messages"
      )
      UPDATE "chat_messages" AS message
      SET "sequence" = ordered_messages.row_num
      FROM ordered_messages
      WHERE message."id" = ordered_messages."id"
    `);

    await queryRunner.query(`
      ALTER TABLE "chat_messages"
      ALTER COLUMN "sequence" SET NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_chat_messages_chatId_sequence"
      ON "chat_messages" ("chatId", "sequence")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_chat_messages_chatId_sequence"`);
    await queryRunner.query(`
      ALTER TABLE "chat_messages"
      DROP COLUMN "sequence"
    `);
  }
}
