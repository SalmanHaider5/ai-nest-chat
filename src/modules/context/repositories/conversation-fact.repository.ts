import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationFact } from '../entities/conversation-fact.entity.js';

@Injectable()
export class ConversationFactRepository {
  constructor(
    @InjectRepository(ConversationFact)
    private readonly repository: Repository<ConversationFact>,
  ) {}

  async create(
    chatId: string,
    key: string,
    value: string,
    sourceMessageId?: string,
  ): Promise<ConversationFact> {
    const fact = this.repository.create({
      chatId,
      key,
      value,
      sourceMessageId: sourceMessageId ?? null,
    });

    return this.repository.save(fact);
  }

  async findByChatId(chatId: string): Promise<ConversationFact[]> {
    return this.repository.find({
      where: { chatId },
      order: { createdAt: 'ASC' },
    });
  }

  async findByChatIdAndType(
    chatId: string,
    type: 'long_term' | 'temporary',
  ): Promise<ConversationFact[]> {
    return this.repository.find({
      where: { chatId, type },
      order: { createdAt: 'ASC' },
    });
  }

  async findByKey(
    chatId: string,
    key: string,
  ): Promise<ConversationFact | null> {
    return this.repository.findOne({
      where: { chatId, key },
    });
  }

  async upsertMany(
    chatId: string,
    facts: {
      key: string;
      value: string;
      type: 'long_term' | 'temporary';
    }[],
  ): Promise<void> {
    if (facts.length === 0) return;

    await this.repository
      .createQueryBuilder()
      .insert()
      .into(ConversationFact)
      .values(
        facts.map((fact) => ({
          chatId,
          key: fact.key,
          value: fact.value,
          type: fact.type,
        })),
      )
      .onConflict(
        `("chatId", "key") WHERE "chatId" IS NOT NULL
       DO UPDATE SET
         "value" = EXCLUDED."value",
         "type" = EXCLUDED."type",
         "updatedAt" = NOW()
       WHERE "conversation_facts"."value"
         IS DISTINCT FROM EXCLUDED."value"
          OR "conversation_facts"."type"
         IS DISTINCT FROM EXCLUDED."type"`,
      )
      .execute();
  }
}
