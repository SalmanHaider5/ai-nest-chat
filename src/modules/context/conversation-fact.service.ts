import { Injectable } from '@nestjs/common';
import { ConversationFactRepository } from './repositories/conversation-fact.repository.js';
import { ConversationFact } from './entities/conversation-fact.entity.js';
import { FactExtractionService } from './fact-extraction.service.js';
import { FactQueryService } from './fact-query.service.js';
import { FACT_CONTEXT_PROMPT } from './prompts/fact-context.prompt.js';

@Injectable()
export class ConversationFactService {
  constructor(
    private readonly factRepository: ConversationFactRepository,
    private readonly factExtractionService: FactExtractionService,
    private readonly factQueryService: FactQueryService,
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

  async getLongTermFacts(): Promise<ConversationFact[]> {
    return this.factRepository.findLongTermByUserId();
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

  async getLongTermFact(key: string): Promise<ConversationFact | null> {
    return this.factRepository.findLongTermByKey(key);
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

    const [longTermFacts, temporaryFacts] = await Promise.all([
      this.getLongTermFacts(),
      this.factRepository.findByChatIdAndType(chatId, 'temporary'),
    ]);

    return [...longTermFacts, ...temporaryFacts];
  }

  async getFactsContext(chatId: string): Promise<string | null> {
    const [longTermFacts, temporaryFacts] = await Promise.all([
      this.getLongTermFacts(),
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

  async getRelevantFacts(
    chatId: string,
    message: string,
  ): Promise<ConversationFact[]> {
    const relevantKeys = this.factQueryService.findRelevantFactKeys(message);

    if (relevantKeys.length === 0) {
      return [];
    }

    const [longTermFacts, temporaryFacts] = await Promise.all([
      this.getLongTermFacts(),
      this.getFactsByType(chatId, 'temporary'),
    ]);

    return [...longTermFacts, ...temporaryFacts].filter((fact) =>
      relevantKeys.includes(fact.key),
    );
  }

  async getRelevantFactsByStoredKeys(
    chatId: string,
    message: string,
  ): Promise<ConversationFact[]> {
    const [longTermFacts, temporaryFacts] = await Promise.all([
      this.getLongTermFacts(),
      this.getFactsByType(chatId, 'temporary'),
    ]);

    const allFacts = [...longTermFacts, ...temporaryFacts];

    const relevantKeys =
      await this.factQueryService.findRelevantFactKeysFromStoredKeys(
        message,
        allFacts.map((fact) => fact.key),
      );

    return allFacts.filter((fact) => relevantKeys.includes(fact.key));
  }
}
