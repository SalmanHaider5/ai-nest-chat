import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service.js';
import { FACT_EXTRACTION_PROMPT } from './prompts/fact-extraction.prompt.js';

export type FactType = 'long_term' | 'temporary';

export type ExtractedFact = {
  key: string;
  value: string;
  type: FactType;
};

@Injectable()
export class FactExtractionService {
  constructor(private readonly aiService: AiService) {}

  async extractFacts(message: string): Promise<ExtractedFact[]> {
    const prompt = `${FACT_EXTRACTION_PROMPT}\n${message}`;

    const response = await this.aiService.generateResponse([
      {
        role: 'user',
        content: prompt,
      },
    ]);

    const facts: unknown = JSON.parse(response);

    if (
      !Array.isArray(facts) ||
      !facts.every(
        (fact) =>
          fact !== null &&
          typeof fact === 'object' &&
          !Array.isArray(fact) &&
          typeof fact.key === 'string' &&
          typeof fact.value === 'string' &&
          (fact.type === 'long_term' || fact.type === 'temporary'),
      )
    ) {
      throw new Error('Invalid fact extraction response');
    }

    return facts as ExtractedFact[];
  }
}
