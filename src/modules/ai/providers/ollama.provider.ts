import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LlmProvider } from './llm.provider.js';
import type { LlmMessage } from "./llm-message.js";

@Injectable()
export class OllamaProvider implements LlmProvider {
  constructor(private readonly configService: ConfigService) {}

  async generateResponse(messages: LlmMessage[]): Promise<string> {
    const baseUrl =
      this.configService.get<string>('ollama.baseUrl') ??
      'http://localhost:11434';

    const model = this.configService.get<string>('ollama.model') ?? 'qwen3:8b';
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);
    try {
      console.log('Request Body:', messages);
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.status}`);
      }
      const data = await response.json();
      if (!data.message?.content) {
        throw new Error("Ollama returned an empty response");
      }
      return String(data.message?.content ?? '');
    } catch (error) {
      console.error('Error generating response from Ollama:', error);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
