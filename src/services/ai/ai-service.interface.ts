import { Result } from '../../utils/result';

export interface IAIService {
  generateCommitMessage(diff: string, prompt: string): Promise<Result<string, string>>;
}