import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service.js';
import { FACT_RELEVANCE_PROMPT } from './prompts/fact-relevance.prompt.js';
import { FACT_DIRECT_LOOKUP_PROMPT } from './prompts/fact-direct-lookup.prompt.js';

@Injectable()
export class FactQueryService {
  constructor(private readonly aiService: AiService) {}
  private readonly patterns: {
    key: string;
    patterns: RegExp[];
  }[] = [
    {
      key: 'favorite_color',
      patterns: [
        /what(?:'s| is) my favorite colou?r/i,
        /which colou?r do i (?:like|prefer) most/i,
      ],
    },
    {
      key: 'preferred_database',
      patterns: [
        /which database do i prefer/i,
        /what is my preferred database/i,
        /which database did i choose/i,
      ],
    },
    {
      key: 'location',
      patterns: [/where do i live/i, /what city do i live in/i],
    },
    {
      key: 'hobby',
      patterns: [/what (?:is|are) my hobbies/i, /what do i enjoy doing/i],
    },
  ];

  async findFactKey(
    message: string,
    storedKeys: string[],
  ): Promise<string | null> {
    if (storedKeys.length === 0) {
      return null;
    }

    const response = await this.aiService.generateResponse([
      {
        role: 'system',
        content: FACT_DIRECT_LOOKUP_PROMPT,
      },
      {
        role: 'user',
        content: JSON.stringify({
          question: message,
          availableKeys: storedKeys,
        }),
      },
    ]);

    const cleanedResponse = response
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```(?:json)?/gi, '')
      .trim();

    let parsed: unknown;

    try {
      parsed = JSON.parse(cleanedResponse);
    } catch {
      // Handle malformed output such as {"favorite_color"}.
      const match = cleanedResponse.match(/^\{\s*"([a-zA-Z0-9_-]+)"\s*\}$/);

      parsed = match?.[1] ?? null;
    }

    if (typeof parsed === 'string' && storedKeys.includes(parsed)) {
      return parsed;
    }

    return null;
  }

  findRelevantFactKeys(message: string): string[] {
    const normalized = message.toLowerCase();
    const relevantKeys: string[] = [];

    const relevancePatterns: {
      key: string;
      patterns: RegExp[];
    }[] = [
      {
        key: 'favorite_color',
        patterns: [/\bcolou?r\b/, /\bfavou?rite colou?r\b/],
      },
      {
        key: 'preferred_database',
        patterns: [
          /\bdatabase\b/,
          /\bpostgres(?:ql)?\b/,
          /\bmysql\b/,
          /\bmongodb\b/,
        ],
      },
      {
        key: 'location',
        patterns: [/\bwhere do i live\b/, /\bmy location\b/, /\bmy city\b/],
      },
      {
        key: 'hobby',
        patterns: [
          /\bhobb(?:y|ies)\b/,
          /\bwhat i enjoy\b/,
          /\bmy interests\b/,
          /\bthings i enjoy\b/,
        ],
      },
    ];

    for (const item of relevancePatterns) {
      if (item.patterns.some((pattern) => pattern.test(normalized))) {
        relevantKeys.push(item.key);
      }
    }

    return relevantKeys;
  }

  async findRelevantFactKeysFromStoredKeys(
    message: string,
    storedKeys: string[],
  ): Promise<string[]> {
    if (storedKeys.length === 0) {
      return [];
    }

    const response = await this.aiService.generateResponse([
      {
        role: 'system',
        content: FACT_RELEVANCE_PROMPT,
      },
      {
        role: 'user',
        content: JSON.stringify({
          question: message,
          availableKeys: storedKeys,
        }),
      },
    ]);

    try {
      const cleanedResponse = response
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/```(?:json)?/gi, '')
        .trim();

      const parsed: unknown = JSON.parse(cleanedResponse);

      if (!Array.isArray(parsed)) {
        return [];
      }

      // Never allow the model to return keys that aren't stored.
      const validKeys = new Set(storedKeys);

      return [
        ...new Set(
          parsed.filter(
            (key): key is string =>
              typeof key === 'string' && validKeys.has(key),
          ),
        ),
      ];
    } catch {
      return [];
    }
  }
}
