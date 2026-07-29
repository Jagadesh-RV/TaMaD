import { AIProvider, AIProviderType, AICompletionRequest, AICompletionResponse } from '../types';
import logger from '../../../utils/logger';

export class OllamaProvider implements AIProvider {
  readonly type: AIProviderType = 'ollama';
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = 'http://localhost:11434', model = 'llama3.2') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  isAvailable(): boolean {
    return true;
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
    const systemMsg = req.messages.find((m) => m.role === 'system');
    const userMsg = req.messages.find((m) => m.role === 'user');
    const prompt = systemMsg
      ? `${systemMsg.content}\n\n${userMsg?.content || ''}`
      : userMsg?.content || '';

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: req.model || this.model,
        prompt,
        stream: false,
        options: {
          temperature: req.temperature ?? 0.3,
          num_predict: req.maxTokens ?? 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(`Ollama API error: ${response.status} ${errorBody}`);
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.response || '',
      model: data.model || this.model,
    };
  }
}
