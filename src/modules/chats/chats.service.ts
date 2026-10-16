import { Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service.js';
import type { MessageDto } from './dto/message.dto.js';
import { ChatRepository } from './repositories/chat.repository.js';
import { ChatMessageRepository } from './repositories/chat-message.repository.js';
import { ContextManagerService } from '../context/context-manager/context-manager.service.js';
import { ConversationFactService } from '../context/conversation-fact.service.js';
import { FactQueryService } from '../context/fact-query.service.js';
import type { LlmMessage } from '../ai/providers/llm-message.js';
import { ConversationFact } from '../context/entities/conversation-fact.entity.js';

@Injectable()
export class ChatsService {
  constructor(
    private readonly aiService: AiService,
    private readonly contextManager: ContextManagerService,
    private readonly chatRepository: ChatRepository,
    private readonly chatMessageRepository: ChatMessageRepository,
    private readonly conversationFactService: ConversationFactService,
    private readonly factQueryService: FactQueryService,
  ) {}

  async findAll() {
    return {
      chats: await this.chatRepository.findAll(),
    };
  }

  async create(dto: MessageDto) {
    let chatId = dto.chatId;
    let context: { messages: LlmMessage[] } = { messages: [] };
    let response: string;
    let facts: ConversationFact[] = [];

    if (chatId) {
      const chat = await this.chatRepository.findById(chatId);

      if (!chat) {
        throw new NotFoundException('Chat not found');
      }
    }

    const factKey = chatId
      ? this.factQueryService.findFactKey(dto.message)
      : null;

    const fact =
      factKey && chatId
        ? await this.conversationFactService.getFact(chatId, factKey)
        : null;

    if (fact) {
      response = `Your ${fact.key.replace(/_/g, ' ')} is ${fact.value}.`;
    } else {
      context = await this.contextManager.buildContext({
        chatId,
        message: dto.message,
      });

      if (chatId) {
        const factsContext =
          await this.conversationFactService.getFactsContext(chatId);

        if (factsContext) {
          context.messages.unshift({
            role: 'system',
            content: factsContext,
          });
        }
      }

      response = await this.aiService.generateResponse(context.messages);
    }

    if (!chatId) {
      const chat = await this.chatRepository.create(dto.message);
      chatId = chat.id;
    }

    await this.chatMessageRepository.create(chatId, 'user', dto.message);
    await this.chatMessageRepository.create(chatId, 'assistant', response);
    await this.chatRepository.touch(chatId);

    // Extract facts only when the LLM handled the message.
    if (!fact) {
      try {
        facts = await this.conversationFactService.extractAndSaveFacts(
          chatId,
          dto.message,
        );
      } catch (error) {
        console.error('Fact extraction failed:', error);
      }
    }

    return {
      chatId,
      context,
      facts,
      message: dto.message,
      response,
    };
  }

  async findMessages(chatId: string) {
    const chat = await this.chatRepository.findById(chatId);

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return {
      messages: await this.chatMessageRepository.findByChatId(chatId),
    };
  }
}
