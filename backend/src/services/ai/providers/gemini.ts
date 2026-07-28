import { GoogleGenAI, Type } from '@google/genai';
import { AIProvider, AIProviderType, AICompletionRequest, AICompletionResponse } from '../types';

export class GeminiProvider implements AIProvider {
  readonly type: AIProviderType = 'gemini';
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model = 'gemini-2.5-flash') {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  isAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
    const systemMsg = req.messages.find((m) => m.role === 'system');
    const userMsg = req.messages.find((m) => m.role === 'user');
    const content = [
      ...(systemMsg ? [{ text: systemMsg.content }] : []),
      { text: userMsg?.content || '' },
    ];

    const response = await this.client.models.generateContent({
      model: req.model || this.model,
      contents: content,
      config: {
        temperature: req.temperature ?? 0.3,
        maxOutputTokens: req.maxTokens ?? 4096,
      },
    });

    return {
      content: response.text || '',
      model: req.model || this.model,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }

  async generateStructured<T>(
    prompt: string,
    schemaDef: { properties: Record<string, unknown>; required?: string[] }
  ): Promise<T> {
    const schema = {
      type: Type.OBJECT,
      properties: schemaDef.properties,
      required: schemaDef.required,
    };

    const response = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: 0.1,
      },
    });

    if (!response.text) {
      throw new Error('Failed to generate structured response');
    }

    return JSON.parse(response.text) as T;
  }
}
