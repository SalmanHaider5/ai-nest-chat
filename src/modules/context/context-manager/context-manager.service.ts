import { Injectable } from '@nestjs/common';
import type { LlmMessage } from '../../ai/providers/llm-message.js';
import type { BuildContextDto } from '../dto/build-context.dto.js';
import type { ContextResult } from '../context-result.js';
import { ChatMessageRepository } from '../../chats/repositories/chat-message.repository.js';
import { ConversationSummaryService } from '../conversation-summary/conversation-summary.service.js';
import { ChatRepository } from '../../chats/repositories/chat.repository.js';
import type { ChatMessage } from '../../chats/entities/chat-message.entity.js';

@Injectable()
export class ContextManagerService {
  constructor(
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly chatRepository: ChatRepository,
    private readonly conversationSummaryService: ConversationSummaryService,
  ) {}

  async buildContext(dto: BuildContextDto): Promise<ContextResult> {
    const messages: LlmMessage[] = [];

    if (dto.chatId) {
      const chat = await this.chatRepository.findById(dto.chatId);

      if (chat) {
        // 1. Fetch messages that are not yet included in the summary.
        const unsummarizedMessages = chat.summaryThroughMessageId
          ? await this.chatMessageRepository.findMessagesAfter(
              dto.chatId,
              chat.summaryThroughMessageId,
              20,
            )
          : await this.chatMessageRepository.findByChatId(dto.chatId);

        // 2. Update the summary when enough unsummarized messages exist.
        if (
          this.conversationSummaryService.shouldUpdateSummary(
            unsummarizedMessages,
          )
        ) {
          const summaryMessages = unsummarizedMessages.slice(0, 20);
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

            // Keep the in-memory chat object in sync with the database.
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

        // 4. Fetch only messages after the current summary boundary.
        const recentMessages = chat.summaryThroughMessageId
          ? await this.chatMessageRepository.findMessagesAfter(
              dto.chatId,
              chat.summaryThroughMessageId,
              20,
            )
          : await this.chatMessageRepository.findRecentByChatId(dto.chatId, 20);

        messages.push(
          ...recentMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        );
      }
    }

    // 5. Add the current message exactly once.
    messages.push({
      role: 'user',
      content: dto.message,
    });

    return { messages };
  }
}
