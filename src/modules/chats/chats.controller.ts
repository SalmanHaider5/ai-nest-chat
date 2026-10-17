import { Body, Controller, Get, Post, Param } from "@nestjs/common";
import { ChatsService } from "./chats.service.js";
import { MessageDto } from "./dto/message.dto.js";

@Controller("chats")
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
  ) {}

  @Get()
  findAll() {
    return this.chatsService.findAll();
  }

  @Post()
  create(@Body() dto: MessageDto) {
    return this.chatsService.create(dto);
  }

  @Get(":chatId/messages")
  findMessages(@Param("chatId") chatId: string) {
    return this.chatsService.findMessages(chatId);
  }

}