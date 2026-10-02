import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatMessage } from "../entities/chat-message.entity.js";

@Injectable()
export class ChatMessageRepository {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly repository: Repository<ChatMessage>,
  ) {}

  async create(
    chatId: string,
    role: "user" | "assistant",
    content: string,
  ): Promise<ChatMessage> {
    const message = this.repository.create({
      chat: {
        id: chatId,
      },
      role,
      content,
    });

    return this.repository.save(message);
  }

  async findByChatId(chatId: string): Promise<ChatMessage[]> {
    return this.repository.find({
      where: {
        chat: {
          id: chatId,
        },
      },
      order: {
        createdAt: "ASC",
      },
    });
  }

}