import axios from 'axios';
import { IAIService } from '../ai-service.interface';
import { Result } from '../../../utils/result';
import { AIConfig } from '../../../configuration/ai-config';

export class OllamaService implements IAIService {
  private baseUrl: string;

  constructor(private config: AIConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
  }

  async generateCommitMessage(diff: string, prompt: string): Promise<Result<string, string>> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/generate`, {
        model: this.config.model,
        prompt: `${prompt}\n\n${diff}`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      }, {
        timeout: 30000,
      });

      const message = response.data.response;
      if (!message) {
        return Result.fail('No response from Ollama');
      }

      return Result.ok(message.trim());
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          return Result.fail('Cannot connect to Ollama. Make sure Ollama is running on ' + this.baseUrl);
        }
        return Result.fail(`Ollama API error: ${error.message}`);
      }
      return Result.fail(`Ollama error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}