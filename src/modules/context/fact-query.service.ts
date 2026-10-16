import { Injectable } from '@nestjs/common';

@Injectable()
export class FactQueryService {
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
      patterns: [
        /where do i live/i,
        /what city do i live in/i,
      ],
    },
    {
      key: 'hobby',
      patterns: [
        /what (?:is|are) my hobbies/i,
        /what do i enjoy doing/i,
      ],
    },
  ];

  findFactKey(message: string): string | null {
    const normalized = message.trim();

    for (const item of this.patterns) {
      if (item.patterns.some((pattern) => pattern.test(normalized))) {
        return item.key;
      }
    }

    return null;
  }
}
