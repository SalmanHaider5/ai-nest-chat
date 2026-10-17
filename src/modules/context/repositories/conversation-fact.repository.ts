import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ConversationFact } from '../entities/conversation-fact.entity.js';
import { LOCAL_USER_ID } from '../constants/local-user.constants.js';

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

  async findLongTermByUserId(): Promise<ConversationFact[]> {
    return this.repository.find({
      where: {
        userId: LOCAL_USER_ID,
        chatId: IsNull(),
        type: 'long_term',
      },
      order: { createdAt: 'ASC' },
    });
  }

  async findLongTermByKey(key: string): Promise<ConversationFact | null> {
    return this.repository.findOne({
      where: {
        userId: LOCAL_USER_ID,
        chatId: IsNull(),
        type: 'long_term',
        key,
      },
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
    const longTermFacts = facts.filter((fact) => fact.type === 'long_term');

    const temporaryFacts = facts.filter((fact) => fact.type === 'temporary');

    if (longTermFacts.length > 0) {
      await this.repository
        .createQueryBuilder()
        .insert()
        .into(ConversationFact)
        .values(
          longTermFacts.map((fact) => ({
            userId: LOCAL_USER_ID,
            chatId: null,
            key: fact.key,
            value: fact.value,
            type: fact.type,
          })),
        )
        .onConflict(
          `("userId", "key")
         WHERE "userId" IS NOT NULL AND "chatId" IS NULL
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

    if (temporaryFacts.length > 0) {
      await this.repository
        .createQueryBuilder()
        .insert()
        .into(ConversationFact)
        .values(
          temporaryFacts.map((fact) => ({
            userId: null,
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
}
