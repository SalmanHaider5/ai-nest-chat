import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity.js';
import { Chat } from '../entities/chat.entity.js';

@Injectable()
export class ChatMessageRepository {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly repository: Repository<ChatMessage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    chatId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<ChatMessage> {
    return this.dataSource.transaction(async (manager) => {
      const chat = await manager.findOne(Chat, {
        where: { id: chatId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!chat) {
        throw new NotFoundException('Chat not found');
      }

      const result = await manager
        .getRepository(ChatMessage)
        .createQueryBuilder('message')
        .select('COALESCE(MAX(message.sequence), 0)', 'maxSequence')
        .where('message.chatId = :chatId', { chatId })
        .getRawOne<{ maxSequence: string }>();

      const sequence = Number(result?.maxSequence ?? 0) + 1;

      const message = manager.create(ChatMessage, {
        chat: { id: chatId },
        role,
        content,
        sequence,
      });

      return manager.save(ChatMessage, message);
    });
  }

  async findByChatId(chatId: string): Promise<ChatMessage[]> {
    return this.repository.find({
      where: { chat: { id: chatId } },
      order: { sequence: 'ASC' },
    });
  }

  async findRecentByChatId(
    chatId: string,
    limit: number,
  ): Promise<ChatMessage[]> {
    const messages = await this.repository.find({
      where: { chat: { id: chatId } },
      order: { sequence: 'DESC' },
      take: limit,
    });

    return messages.reverse();
  }

  async findMessagesAfter(
    chatId: string,
    messageId: string,
    limit: number,
  ): Promise<ChatMessage[]> {
    const boundaryMessage = await this.repository.findOne({
      where: {
        id: messageId,
        chat: { id: chatId },
      },
      select: {
        id: true,
        sequence: true,
      },
    });

    if (!boundaryMessage) {
      return [];
    }

    return this.repository
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId })
      .andWhere('message.sequence > :sequence', {
        sequence: boundaryMessage.sequence,
      })
      .orderBy('message.sequence', 'ASC')
      .take(limit)
      .getMany();
  }
}
