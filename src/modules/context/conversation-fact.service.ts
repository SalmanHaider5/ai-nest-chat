import { Injectable } from '@nestjs/common';
import { ConversationFactRepository } from './repositories/conversation-fact.repository.js';
import { ConversationFact } from './entities/conversation-fact.entity.js';
import { FactExtractionService } from './fact-extraction.service.js';
import { FACT_CONTEXT_PROMPT } from './prompts/fact-context.prompt.js';

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

  async getFactsByType(
    chatId: string,
    type: 'long_term' | 'temporary',
  ): Promise<ConversationFact[]> {
    return this.factRepository.findByChatIdAndType(chatId, type);
  }

  async getFact(chatId: string, key: string): Promise<ConversationFact | null> {
    return this.factRepository.findByKey(chatId, key);
  }

  async saveFacts(
    chatId: string,
    facts: {
      key: string;
      value: string;
      type: 'long_term' | 'temporary';
    }[],
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

  async getFactsContext(chatId: string): Promise<string | null> {
    const [longTermFacts, temporaryFacts] = await Promise.all([
      this.factRepository.findByChatIdAndType(chatId, 'long_term'),
      this.factRepository.findByChatIdAndType(chatId, 'temporary'),
    ]);

    if (longTermFacts.length === 0 && temporaryFacts.length === 0) {
      return null;
    }

    const formattedFacts = [
      longTermFacts.length > 0
        ? `Long-term facts:\n${longTermFacts
            .map((fact) => `${fact.key}: ${fact.value}`)
            .join('\n')}`
        : '',
      temporaryFacts.length > 0
        ? `Temporary facts for this conversation:\n${temporaryFacts
            .map((fact) => `${fact.key}: ${fact.value}`)
            .join('\n')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    return FACT_CONTEXT_PROMPT.replace('{{facts}}', formattedFacts);
  }
}
