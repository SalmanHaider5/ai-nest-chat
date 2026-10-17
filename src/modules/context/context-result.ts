import type { LlmMessage } from "../ai/providers/llm-message.js";

export type ContextResult = {
  messages: LlmMessage[];
};