import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AiModule } from "../ai/ai.module.js";
import { ChatsController } from "./chats.controller.js";
import { ChatsService } from "./chats.service.js";
import { Chat } from "./entities/chat.entity.js";
import { ChatMessage } from "./entities/chat-message.entity.js";
import { ChatRepository } from "./repositories/chat.repository.js";
import { ChatMessageRepository } from "./repositories/chat-message.repository.js";
import { ContextModule } from "../context/context.module.js";

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMessage]),
    AiModule,
    ContextModule,
  ],
  controllers: [ChatsController],
  providers: [
    ChatsService,
    ChatRepository,
    ChatMessageRepository
  ],
  exports: [ChatMessageRepository],
})
export class ChatsModule {}