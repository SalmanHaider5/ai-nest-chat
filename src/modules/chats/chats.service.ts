import { Injectable } from "@nestjs/common";
import { AiService } from "../ai/ai.service.js";
import type { MessageDto } from "./dto/message.dto.js";

@Injectable()
export class ChatsService {
  constructor(
    private readonly aiService: AiService,
  ) {}

  findAll() {
    return {
      chats: [],
    };
  }

  async create(dto: MessageDto) {
    const response = await this.aiService.generateResponse(dto.message);
    return {
      message: dto.message,
      response,
    };
  }
}