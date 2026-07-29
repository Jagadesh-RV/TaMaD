import { AIProvider, AIProviderType, AICompletionRequest, AICompletionResponse } from '../types';
import logger from '../../../utils/logger';

export class ClaudeProvider implements AIProvider {
  readonly type: AIProviderType = 'claude';
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl = 'https://api.anthropic.com/v1', model = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  isAvailable(): boolean {
    return !!process.env.CLAUDE_API_KEY;
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
    const systemMsg = req.messages.find((m) => m.role === 'system');
    const nonSystem = req.messages.filter((m) => m.role !== 'system');

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: req.model || this.model,
        system: systemMsg?.content,
        messages: nonSystem.map((m) => ({ role: m.role, content: m.content })),
        max_tokens: req.maxTokens ?? 4096,
        temperature: req.temperature ?? 0.3,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(`Claude API error: ${response.status} ${errorBody}`);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content?.[0]?.text || '',
      model: data.model || this.model,
      usage: data.usage
        ? {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          }
        : undefined,
    };
  }
}
