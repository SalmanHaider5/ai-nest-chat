import { Injectable } from '@nestjs/common';
import { ConversationFactRepository } from './repositories/conversation-fact.repository.js';
import { ConversationFact } from './entities/conversation-fact.entity.js';
import { FactExtractionService } from './fact-extraction.service.js';

@Injectable()
export class ConversationFactService {
  constructor(
    private readonly factRepository: ConversationFactRepository,
    private readonly factExtractionService: FactExtractionService,
  ) {}

  async saveFact(
    chatId: string,
    key: string,
    value: string,
    sourceMessageId?: string,
  ): Promise<ConversationFact> {
    return this.factRepository.create(chatId, key, value, sourceMessageId);
  }

  async getFacts(chatId: string): Promise<ConversationFact[]> {
    return this.factRepository.findByChatId(chatId);
  }

  async getFact(chatId: string, key: string): Promise<ConversationFact | null> {
    return this.factRepository.findByKey(chatId, key);
  }

  async saveFacts(
    chatId: string,
    facts: { key: string; value: string }[],
  ): Promise<void> {
    await this.factRepository.upsertMany(chatId, facts);
  }

  async extractAndSaveFacts(
    chatId: string,
    message: string,
  ): Promise<ConversationFact[]> {
    const facts = await this.factExtractionService.extractFacts(message);

    await this.factRepository.upsertMany(chatId, facts);

    return this.factRepository.findByChatId(chatId);
  }

}
