import { Injectable } from '@nestjs/common';
import { AiService } from '../../ai/ai.service.js';
import type { ChatMessage } from '../../chats/entities/chat-message.entity.js';
import { CONVERSATION_SUMMARY_PROMPT } from '../prompts/conversation-summary.prompt.js';

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
      CONVERSATION_SUMMARY_PROMPT,
      previousSummary
        ? `Existing summary:\n${previousSummary}`
        : 'No existing summary.',
      `New conversation messages:\n${conversation}`,
      'Produce the complete updated summary using the rules above.',
    ].join('\n\n');

    return this.aiService.generateResponse([
      {
        role: 'user',
        content: prompt,
      },
    ]);
  }
}
