import { Inject, Injectable } from "@nestjs/common";
import type { LlmProvider } from "./providers/llm.provider.js";
import { LLM_PROVIDER } from "./providers/llm-provider.token.js";

@Injectable()
export class AiService {
  constructor(
    @Inject(LLM_PROVIDER)
    private readonly llmProvider: LlmProvider,
  ) {}

  async generateResponse(message: string): Promise<string> {
    return this.llmProvider.generateResponse(message);
  }
}