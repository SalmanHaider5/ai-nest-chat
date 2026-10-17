
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateConversationFacts1791900000000
  implements MigrationInterface
{
  name = 'CreateConversationFacts1791900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "conversation_facts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid,
        "chatId" uuid,
        "key" character varying(100) NOT NULL,
        "value" text NOT NULL,
        "sourceMessageId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_conversation_facts_id"
          PRIMARY KEY ("id"),
        CONSTRAINT "CHK_conversation_facts_scope"
          CHECK ("userId" IS NOT NULL OR "chatId" IS NOT NULL),
        CONSTRAINT "FK_conversation_facts_chat"
          FOREIGN KEY ("chatId")
          REFERENCES "chats"("id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_conversation_facts_source_message"
          FOREIGN KEY ("sourceMessageId")
          REFERENCES "chat_messages"("id")
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_conversation_facts_user_key"
      ON "conversation_facts" ("userId", "key")
      WHERE "userId" IS NOT NULL AND "chatId" IS NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_conversation_facts_chat_key"
      ON "conversation_facts" ("chatId", "key")
      WHERE "chatId" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX "UQ_conversation_facts_chat_key"
    `);

    await queryRunner.query(`
      DROP INDEX "UQ_conversation_facts_user_key"
    `);

    await queryRunner.query(`
      DROP TABLE "conversation_facts"
    `);
  }
}
