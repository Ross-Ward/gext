import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAIService } from '../ai-service.interface';
import { Result } from '../../../utils/result';
import { AIConfig } from '../../../configuration/ai-config';

export class GeminiService implements IAIService {
  private genAI: GoogleGenerativeAI;

  constructor(private config: AIConfig) {
    if (!config.apiKey) {
      throw new Error('Google Gemini API key is required');
    }
    
    this.genAI = new GoogleGenerativeAI(config.apiKey);
  }

  async generateCommitMessage(diff: string, prompt: string): Promise<Result<string, string>> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.config.model });
      
      const result = await model.generateContent(`${prompt}\n\n${diff}`);
      const response = await result.response;
      const message = response.text();

      if (!message) {
        return Result.fail('No response from Gemini');
      }

      return Result.ok(message.trim());
    } catch (error) {
      return Result.fail(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}