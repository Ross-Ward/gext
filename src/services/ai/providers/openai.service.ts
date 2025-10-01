import OpenAI from 'openai';
import { IAIService } from '../ai-service.interface';
import { Result } from '../../../utils/result';
import { AIConfig } from '../../../configuration/ai-config';

export class OpenAIService implements IAIService {
  private client: OpenAI;

  constructor(private config: AIConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  async generateCommitMessage(diff: string, prompt: string): Promise<Result<string, string>> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\n${diff}`
          }
        ],
        max_tokens: 200,  // Reduced from 500
        temperature: 0.3, // Lower temperature for more focused output
      });

      const message = response.choices[0]?.message?.content;
      if (!message) {
        return Result.fail('No response from OpenAI');
      }

      return Result.ok(message.trim());
    } catch (error) {
      return Result.fail(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}