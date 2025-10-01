import { IAIService } from './ai-service.interface';
import { AIConfig } from '../../configuration/ai-config';
import { OpenAIService } from './providers/openai.service';
import { OllamaService } from './providers/ollama.service';
import { GroqService } from './providers/groq.service';
import { GeminiService } from './providers/gemini.service';

export class AIServiceFactory {
  static create(config: AIConfig): IAIService {
    switch (config.provider) {
      case 'openai':
        return new OpenAIService(config);
      case 'ollama':
        return new OllamaService(config);
      case 'groq':
        return new GroqService(config);
      case 'gemini':
        return new GeminiService(config);
      default:
        throw new Error(`Unknown AI provider: ${config.provider}`);
    }
  }

  static getSupportedProviders(): string[] {
    return ['openai', 'ollama', 'groq', 'gemini'];
  }

  static getProviderInfo(): Record<string, { description: string; free: boolean; local: boolean }> {
    return {
      ollama: {
        description: 'Local AI models (Llama, Mistral, etc.)',
        free: true,
        local: true
      },
      groq: {
        description: 'Fast cloud inference with generous free tier',
        free: true,
        local: false
      },
      gemini: {
        description: 'Google Gemini with free tier',
        free: true,
        local: false
      },
      openai: {
        description: 'OpenAI GPT models (paid)',
        free: false,
        local: false
      }
    };
  }
}