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

    // 1. Validate the existing chat or create a new one.
    if (chatId) {
      const chat = await this.chatRepository.findById(chatId);

      if (!chat) {
        throw new NotFoundException('Chat not found');
      }
    } else {
      const chat = await this.chatRepository.create(dto.message);
      chatId = chat.id;
    }

    // 2. Check whether a known fact can answer the question directly.
    const [longTermFacts, temporaryFacts] = await Promise.all([
      this.conversationFactService.getLongTermFacts(),
      chatId
        ? this.conversationFactService.getFactsByType(chatId, 'temporary')
        : Promise.resolve([]),
    ]);

    const availableFacts = [...longTermFacts, ...temporaryFacts];

    const factKey = await this.factQueryService.findFactKey(
      dto.message,
      availableFacts.map((fact) => fact.key),
    );

    const fact = factKey
      ? (availableFacts.find((item) => item.key === factKey) ?? null)
      : null;

    // 3. Answer directly from facts or build context and call the LLM.
    if (fact) {
      response = `Your ${fact.key.replace(/_/g, ' ')} is ${fact.value}.`;
    } else {
      context = await this.contextManager.buildContext({
        chatId,
        message: dto.message,
      });

      response = await this.aiService.generateResponse(context.messages);
    }

    // 4. Persist the conversation messages.
    await this.chatMessageRepository.create(chatId, 'user', dto.message);
    await this.chatMessageRepository.create(chatId, 'assistant', response);
    await this.chatRepository.touch(chatId);

    // 5. Extract and save facts only when the LLM handled the message.
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
