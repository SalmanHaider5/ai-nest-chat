import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateLongTermFactsToUserScope1792230000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Keep only the latest version of each long-term fact.
    await queryRunner.query(`
      WITH ranked_facts AS (
        SELECT
          id,
          ROW_NUMBER() OVER (
            PARTITION BY key
            ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
          ) AS row_num
        FROM conversation_facts
        WHERE type = 'long_term'
      )
      DELETE FROM conversation_facts
      WHERE id IN (
        SELECT id
        FROM ranked_facts
        WHERE row_num > 1
      );
    `);

    // Move remaining long-term facts to the local user.
    await queryRunner.query(`
      UPDATE conversation_facts
      SET
        "userId" = '00000000-0000-4000-8000-000000000001',
        "chatId" = NULL
      WHERE type = 'long_term';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Original chat ownership cannot be reconstructed after migration.
    // Preserve the migrated data rather than assigning incorrect chat IDs.
    void queryRunner;
    throw new Error(
      'This migration cannot be safely reverted because original chat ownership was not preserved.',
    );
  }
}