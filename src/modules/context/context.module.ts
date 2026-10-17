import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chat } from "../chats/entities/chat.entity.js";
import { ChatMessage } from "../chats/entities/chat-message.entity.js";
import { ChatMessageRepository } from "../chats/repositories/chat-message.repository.js";
import { ContextManagerService } from "./context-manager/context-manager.service.js";
import { ConversationSummaryService } from './conversation-summary/conversation-summary.service.js';
import { ChatRepository } from "../chats/repositories/chat.repository.js";
import { AiModule } from "../ai/ai.module.js";
import { ConversationFact } from './entities/conversation-fact.entity.js';
import { ConversationFactRepository } from './repositories/conversation-fact.repository.js';
import { ConversationFactService } from './conversation-fact.service.js';
import { ConversationFactController } from './conversation-fact.controller.js';
import { FactExtractionService } from './fact-extraction.service.js';
import { FactQueryService } from './fact-query.service.js';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Chat,
      ChatMessage,
      ConversationFact
    ]),
    AiModule
  ],
  controllers: [ConversationFactController],
  providers: [
    ChatRepository,
    ContextManagerService,
    ChatMessageRepository,
    ConversationSummaryService,
    ConversationFactRepository,
    ConversationFactService,
    FactExtractionService,
    FactQueryService,
  ],
  exports: [
    ContextManagerService,
    ConversationSummaryService,
    ConversationFactService,
    FactQueryService,
  ],
})
export class ContextModule {}