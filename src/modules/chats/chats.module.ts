import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module.js";
import { ChatsController } from "./chats.controller.js";
import { ChatsService } from "./chats.service.js";

@Module({
  imports: [AiModule],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}