import { MigrationInterface, QueryRunner } from "typeorm";

export class AddChatSummary1791270692808 implements MigrationInterface {
    name = 'AddChatSummary1791270692808'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats" ADD "summary" text`);
        await queryRunner.query(`ALTER TABLE "chats" ADD "summaryThroughMessageId" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "summaryThroughMessageId"`);
        await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "summary"`);
    }

}
