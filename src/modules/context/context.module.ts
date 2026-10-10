import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chat } from "../chats/entities/chat.entity.js";
import { ChatMessage } from "../chats/entities/chat-message.entity.js";
import { ChatMessageRepository } from "../chats/repositories/chat-message.repository.js";
import { ContextManagerService } from "./context-manager/context-manager.service.js";
import { ConversationSummaryService } from './conversation-summary/conversation-summary.service.js';
import { ChatRepository } from "../chats/repositories/chat.repository.js";
import { AiModule } from "../ai/ai.module.js";


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Chat,
      ChatMessage
    ]),
    AiModule
  ],
  providers: [
    ChatRepository,
    ContextManagerService,
    ChatMessageRepository,
    ConversationSummaryService
  ],
  exports: [
    ContextManagerService,
    ConversationSummaryService
  ],
})
export class ContextModule {}