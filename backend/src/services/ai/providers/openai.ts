import { AIProvider, AIProviderType, AICompletionRequest, AICompletionResponse } from '../types';
import logger from '../../../utils/logger';

export class OpenAIProvider implements AIProvider {
  readonly type: AIProviderType = 'openai';
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl = 'https://api.openai.com/v1', model = 'gpt-4o') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: req.model || this.model,
        messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: req.temperature ?? 0.3,
        max_tokens: req.maxTokens ?? 4096,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(`OpenAI API error: ${response.status} ${errorBody}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model || this.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }
}
