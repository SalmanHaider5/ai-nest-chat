import type { LlmMessage } from "./llm-message.js";

export interface LlmProvider {
  generateResponse(messages: LlmMessage[]): Promise<string>;
}