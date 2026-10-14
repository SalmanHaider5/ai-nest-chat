import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConversationFactService } from './conversation-fact.service.js';
import { FactExtractionService } from './fact-extraction.service.js';

@Controller('chats/:chatId/facts')
export class ConversationFactController {
  constructor(
    private readonly factService: ConversationFactService,
    private readonly factExtractionService: FactExtractionService,
  ) {}

  @Post()
  async saveFacts(
    @Param('chatId') chatId: string,
    @Body() facts: { key: string; value: string }[],
  ) {
    await this.factService.saveFacts(chatId, facts);

    return {
      message: 'Facts saved successfully',
      count: facts.length,
    };
  }

  @Get()
  async getFacts(@Param('chatId') chatId: string) {
    return this.factService.getFacts(chatId);
  }

  @Get(':key')
  async getFact(@Param('chatId') chatId: string, @Param('key') key: string) {
    return this.factService.getFact(chatId, key);
  }

  @Post('extract')
  async extractFacts(@Body() body: { message: string }) {
    const result = await this.factExtractionService.extractFacts(body.message);

    return { result };
  }
}
