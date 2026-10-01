import { Module } from "@nestjs/common";
import { AiService } from "./ai.service.js";
import { OllamaProvider } from "./providers/ollama.provider.js";
import { LLM_PROVIDER } from "./providers/llm-provider.token.js";

@Module({
  providers: [
    OllamaProvider,
    {
      provide: LLM_PROVIDER,
      useExisting: OllamaProvider,
    },
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}