import { Injectable } from '@nestjs/common';
import type { LlmMessage } from '../../ai/providers/llm-message.js';
import type { BuildContextDto } from '../dto/build-context.dto.js';
import type { ContextResult } from '../context-result.js';
import { ChatMessageRepository } from '../../chats/repositories/chat-message.repository.js';
import { ConversationSummaryService } from '../conversation-summary/conversation-summary.service.js';
import { ChatRepository } from '../../chats/repositories/chat.repository.js';
import { ConversationFactService } from '../conversation-fact.service.js';
import {
  RECENT_MESSAGES_LIMIT,
  SUMMARY_BATCH_SIZE,
} from '../constants/context.constants.js';

@Injectable()
export class ContextManagerService {
  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly chatRepository: ChatRepository,
    private readonly conversationSummaryService: ConversationSummaryService,
    private readonly conversationFactService: ConversationFactService,
  ) {}

  async buildContext(dto: BuildContextDto): Promise<ContextResult> {
    const messages: LlmMessage[] = [];

    if (dto.chatId) {
      const chat = await this.chatRepository.findById(dto.chatId);

      if (chat) {
        // 1. Fetch messages not yet included in the summary.
        const unsummarizedMessages = chat.summaryThroughMessageId
          ? await this.chatMessageRepository.findMessagesAfter(
              dto.chatId,
              chat.summaryThroughMessageId,
              SUMMARY_BATCH_SIZE,
            )
          : await this.chatMessageRepository.findByChatId(dto.chatId);

        // 2. Update the summary when enough unsummarized messages exist.
        if (
          this.conversationSummaryService.shouldUpdateSummary(
            unsummarizedMessages,
          )
        ) {
          const summaryMessages = unsummarizedMessages.slice(
            0,
            SUMMARY_BATCH_SIZE,
          );
          const lastMessage = summaryMessages[summaryMessages.length - 1];

          if (lastMessage) {
            const summary =
              await this.conversationSummaryService.generateSummary(
                chat.summary,
                summaryMessages,
              );

            await this.chatRepository.updateSummary(
              dto.chatId,
              summary,
              lastMessage.id,
            );

            chat.summary = summary;
            chat.summaryThroughMessageId = lastMessage.id;
          }
        }

        // 3. Include the summary, if one exists.
        if (chat.summary) {
          messages.push({
            role: 'system',
            content: `Conversation summary:\n${chat.summary}`,
          });
        }

        // 4. Fetch recent messages after the summary boundary.
        const recentMessages = chat.summaryThroughMessageId
          ? await this.chatMessageRepository.findMessagesAfter(
              dto.chatId,
              chat.summaryThroughMessageId,
              RECENT_MESSAGES_LIMIT,
            )
          : await this.chatMessageRepository.findRecentByChatId(
              dto.chatId,
              RECENT_MESSAGES_LIMIT,
            );

        messages.push(
          ...recentMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        );

        // 5. Include global long-term facts and this chat's temporary facts.
        const relevantFacts =
          await this.conversationFactService.getRelevantFactsByStoredKeys(
            dto.chatId,
            dto.message,
          );

        if (relevantFacts.length > 0) {
          const factsContext = [
            'Use these known facts when relevant. Do not assume facts that are not listed.',
            ...relevantFacts.map((fact) => `${fact.key}: ${fact.value}`),
          ].join('\n');

          messages.unshift({
            role: 'system',
            content: factsContext,
          });
        }
      }
    }

    // 6. Add the current message exactly once.
    messages.push({
      role: 'user',
      content: dto.message,
    });

    return { messages };
  }
}
