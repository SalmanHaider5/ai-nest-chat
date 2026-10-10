import { Injectable } from '@nestjs/common';
import { AiService } from '../../ai/ai.service.js';
import type { ChatMessage } from '../../chats/entities/chat-message.entity.js';

@Injectable()
export class ConversationSummaryService {
  private readonly summaryThreshold = 20;

  constructor(private readonly aiService: AiService) {}

  shouldUpdateSummary(unsummarizedMessages: ChatMessage[]): boolean {
    return unsummarizedMessages.length >= this.summaryThreshold;
  }

  async generateSummary(
    previousSummary: string | null,
    messages: ChatMessage[],
  ): Promise<string> {
    const conversation = messages
      .map((message) => `${message.role}: ${message.content}`)
      .join('\n');

    const prompt = [
      'Create a concise summary of this conversation for future AI responses.',
      'Preserve important facts, user preferences, decisions, constraints, and unresolved tasks.',
      'Do not invent information.',
      previousSummary ? `Previous summary:\n${previousSummary}` : '',
      `New conversation messages:\n${conversation}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    return this.aiService.generateResponse([
      {
        role: 'user',
        content: prompt,
      },
    ]);
  }
}
