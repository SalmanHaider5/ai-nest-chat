import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Chat } from "../entities/chat.entity.js";

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(Chat)
    private readonly repository: Repository<Chat>,
  ) {}

  async create(title: string): Promise<Chat> {
    const chat = this.repository.create({
      title,
    });

    return this.repository.save(chat);
  }

  async findAll(): Promise<Chat[]> {
    return this.repository.find({
      order: {
        updatedAt: "DESC",
      },
    });
  }

  async findById(id: string): Promise<Chat | null> {
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }

  async touch(chatId: string): Promise<void> {
    await this.repository.update(chatId, {
      updatedAt: new Date(),
    });
  }
}