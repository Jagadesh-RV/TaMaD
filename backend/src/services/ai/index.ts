import {
  AIProvider,
  AIProviderType,
  AIProviderConfig,
  AICompletionRequest,
  AICompletionResponse,
  AI_PROVIDER_CONFIGS,
} from './types';
import { GeminiProvider, OpenAIProvider, ClaudeProvider, OllamaProvider } from './providers';
import logger from '../../utils/logger';

export type { AIProvider, AIProviderType, AICompletionRequest, AICompletionResponse };
export * from './types';
export * from './workspaceChat';
export * from './taskParser';
export * from './projectPlanner';
export * from './dailyPlanner';

class AIService {
  private providers: Map<AIProviderType, AIProvider> = new Map();
  private defaultProvider: AIProviderType = 'gemini';

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    if (process.env.GEMINI_API_KEY) {
      this.providers.set(
        'gemini',
        new GeminiProvider(process.env.GEMINI_API_KEY, AI_PROVIDER_CONFIGS.gemini.model)
      );
      logger.info('AI Provider: Gemini initialized');
    }

    if (process.env.OPENAI_API_KEY) {
      this.providers.set(
        'openai',
        new OpenAIProvider(process.env.OPENAI_API_KEY)
      );
      logger.info('AI Provider: OpenAI initialized');
    }

    if (process.env.CLAUDE_API_KEY) {
      this.providers.set(
        'claude',
        new ClaudeProvider(process.env.CLAUDE_API_KEY)
      );
      logger.info('AI Provider: Claude initialized');
    }

    this.providers.set(
      'ollama',
      new OllamaProvider(
        AI_PROVIDER_CONFIGS.ollama.baseUrl,
        AI_PROVIDER_CONFIGS.ollama.model
      )
    );
    logger.info('AI Provider: Ollama initialized (local)');

    const available = this.getAvailableProviders();
    if (available.length === 0) {
      logger.warn('No AI providers with API keys configured. AI features will be limited.');
    } else {
      logger.info(`Available AI providers: ${available.join(', ')}`);
    }

    if (available.includes('gemini')) {
      this.defaultProvider = 'gemini';
    } else if (available.includes('openai')) {
      this.defaultProvider = 'openai';
    } else if (available.includes('claude')) {
      this.defaultProvider = 'claude';
    } else {
      this.defaultProvider = 'ollama';
    }
  }

  getProvider(type?: AIProviderType): AIProvider {
    const providerType = type || this.defaultProvider;
    const provider = this.providers.get(providerType);
    if (provider) return provider;
    if (type) {
      throw new Error(`AI provider '${type}' is not configured. Set the appropriate API key.`);
    }
    if (this.providers.size > 0) {
      const firstProvider = this.providers.values().next();
      if (firstProvider.value) return firstProvider.value;
    }
    throw new Error('No AI providers available. Configure at least one provider API key.');
  }

  getAvailableProviders(): AIProviderType[] {
    return Array.from(this.providers.entries())
      .filter(([_, p]) => p.isAvailable())
      .map(([type]) => type);
  }

  getDefaultProvider(): AIProviderType {
    return this.defaultProvider;
  }

  async complete(req: AICompletionRequest, provider?: AIProviderType): Promise<AICompletionResponse> {
    const p = this.getProvider(provider);
    return p.complete(req);
  }
}

export const aiService = new AIService();
