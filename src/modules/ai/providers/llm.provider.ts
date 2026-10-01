export interface LlmProvider {
  generateResponse(message: string): Promise<string>;
}