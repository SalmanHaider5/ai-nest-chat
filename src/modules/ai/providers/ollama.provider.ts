import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { LlmProvider } from './llm.provider.js';

@Injectable()
export class OllamaProvider implements LlmProvider {
  constructor(private readonly configService: ConfigService) {}

  async generateResponse(message: string): Promise<string> {
    const baseUrl =
      this.configService.get<string>('ollama.baseUrl') ??
      'http://localhost:11434';

    const model = this.configService.get<string>('ollama.model') ?? 'qwen3:8b';
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);
    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: message,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.status}`);
      }
      const data = await response.json();
      if (!data.response) {
        throw new Error("Ollama returned an empty response");
      }
      return String(data.response ?? '');
    } catch (error) {
      console.error('Error generating response from Ollama:', error);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
