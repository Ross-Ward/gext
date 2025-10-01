import axios from 'axios';
import { IAIService } from '../ai-service.interface';
import { Result } from '../../../utils/result';
import { AIConfig } from '../../../configuration/ai-config';

export class GroqService implements IAIService {
  private baseUrl = 'https://api.groq.com/openai/v1';

  constructor(private config: AIConfig) {
    if (!config.apiKey) {
      throw new Error('Groq API key is required');
    }
  }

  async generateCommitMessage(diff: string, prompt: string): Promise<Result<string, string>> {
    try {
      const content = `${prompt}\n\n${diff}`;
      console.log(`DEBUG: Sending ${content.length} characters to Groq`);
      console.log(`DEBUG: Content preview: ${content.substring(0, 200)}...`);
      
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: 200,  // Reduced from 500
        temperature: 0.3, // Lower temperature
      }, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      const message = response.data.choices[0]?.message?.content;
      if (!message) {
        return Result.fail('No response from Groq');
      }

      return Result.ok(message.trim());
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return Result.fail(`Groq API error: ${error.response?.data?.error?.message || error.message}`);
      }
      return Result.fail(`Groq error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}