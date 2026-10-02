import { Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service.js';
import type { MessageDto } from './dto/message.dto.js';
import { ChatRepository } from './repositories/chat.repository.js';
import { ChatMessageRepository } from './repositories/chat-message.repository.js';

@Injectable()
export class ChatsService {
  constructor(
    private readonly aiService: AiService,
    private readonly chatRepository: ChatRepository,
    private readonly chatMessageRepository: ChatMessageRepository,
  ) {}

  async findAll() {
    return {
      chats: await this.chatRepository.findAll(),
    };
  }

  async create(dto: MessageDto) {
    let chatId = dto.chatId;

    if (chatId) {
      const chat = await this.chatRepository.findById(chatId);

      if (!chat) {
        throw new NotFoundException('Chat not found');
      }
    }

    const response = await this.aiService.generateResponse(dto.message);

    if (!chatId) {
      const chat = await this.chatRepository.create(dto.message);
      chatId = chat.id;
    }

    await this.chatMessageRepository.create(chatId, 'user', dto.message);
    await this.chatMessageRepository.create(chatId, 'assistant', response);
    await this.chatRepository.touch(chatId);

    return {
      chatId,
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
