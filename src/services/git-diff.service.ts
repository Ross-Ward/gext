import * as fs from 'fs';
import * as path from 'path';
import { Result } from '../utils/result';
import { CommandRunnerService } from './command-runner.service';
import { AIServiceFactory } from './ai/ai-service.factory';
import { GitConfig, AIConfig } from '../configuration/ai-config';

export class GitDiffService {
  private projectRoot: string | null = null;

  constructor(
    private commandRunner: CommandRunnerService,
    private gitConfig: GitConfig,
    private aiConfig: AIConfig
  ) {
    this.projectRoot = this.getProjectRoot();
  }

  async addAll(): Promise<Result<string, string>> {
    if (!this.projectRoot) {
      return Result.fail('No .git repository found or not in a git repository');
    }

    // Check if there are already staged changes
    const stagedResult = await this.commandRunner.run('git', ['diff', '--staged', '--name-only'], this.projectRoot);
    if (stagedResult.isSuccess && stagedResult.value.trim()) {
      // Already have staged changes, don't add more
      return Result.ok('Using existing staged changes');
    }

    return await this.commandRunner.run('git', ['add', '.'], this.projectRoot);
  }

  async getDiff(): Promise<Result<string, string>> {
    if (!this.projectRoot) {
      return Result.fail('No .git repository found or not in a git repository');
    }

    // Just get file names to minimize tokens
    const result = await this.commandRunner.run('git', [
      'diff', 
      '--staged',
      '--name-status'  // Just file names and status (A/M/D)
    ], this.projectRoot);
    
    if (result.isError) {
      return Result.fail(`Git diff failed: ${result.error}`);
    }

    if (!result.value.trim()) {
      return Result.fail('No staged changes found');
    }

    // Limit to first 10 files to reduce tokens
    const lines = result.value.split('\n').slice(0, 10);
    const limitedResult = lines.join('\n');
    
    return Result.ok(limitedResult);
  }

  private limitDiffSize(diff: string, maxLines: number = 50): string {
    const lines = diff.split('\n');
    
    if (lines.length <= maxLines) {
      return diff;
    }

    // For large diffs, just return file stats instead of full diff
    const statLines = lines.filter(line => 
      line.includes('|') && (line.includes('+') || line.includes('-'))
    ).slice(0, 20);
    
    const summary = [
      `${lines.length} total lines in diff (truncated for token efficiency)`,
      '',
      'File changes:',
      ...statLines,
      '',
      `... and ${Math.max(0, lines.length - maxLines)} more lines`
    ];
    
    return summary.join('\n');
  }

  async commit(message: string): Promise<Result<string, string>> {
    if (!this.projectRoot) {
      return Result.fail('No .git repository found or not in a git repository');
    }

    return await this.commandRunner.run('git', ['commit', '-m', message], this.projectRoot);
  }

  async push(): Promise<Result<string, string>> {
    if (!this.projectRoot) {
      return Result.fail('No .git repository found or not in a git repository');
    }

    return await this.commandRunner.run('git', ['push'], this.projectRoot);
  }

  async getDiffSummary(): Promise<Result<string, string>> {
    const diffResult = await this.getDiff();
    if (diffResult.isError) {
      return diffResult;
    }

    const prompt = this.loadPrompt();
    const aiService = AIServiceFactory.create(this.aiConfig);
    
    const summaryResult = await aiService.generateCommitMessage(diffResult.value, prompt);
    if (summaryResult.isError) {
      return summaryResult;
    }

    // Add signature if configured
    let finalMessage = summaryResult.value;
    if (this.gitConfig.commitSignature) {
      finalMessage += this.gitConfig.commitSignature;
    }

    return Result.ok(finalMessage);
  }

  private getProjectRoot(): string | null {
    const currentDirectory = process.cwd();
    let directory = currentDirectory;
    let depth = 0;

    while (depth < this.gitConfig.maxRecursiveDirectories) {
      if (this.isGitRepository(directory)) {
        return directory;
      }

      const parentDirectory = path.dirname(directory);
      if (parentDirectory === directory) {
        break; // Reached root directory
      }

      directory = parentDirectory;
      depth++;
    }

    return null;
  }

  private isGitRepository(directoryPath: string): boolean {
    return fs.existsSync(path.join(directoryPath, '.git'));
  }

  private loadPrompt(): string {
    const defaultPrompt = `Write a commit message for these file changes. Format: title, blank line, 2-3 bullet points with "-". Be concise:`;

    if (!this.aiConfig.promptPath) {
      return defaultPrompt;
    }

    try {
      let promptPath = this.aiConfig.promptPath;
      if (!path.isAbsolute(promptPath)) {
        promptPath = path.join(process.cwd(), promptPath);
      }

      if (fs.existsSync(promptPath)) {
        return fs.readFileSync(promptPath, 'utf-8').trim();
      }
    } catch (error) {
      // Fall back to default prompt
    }

    return defaultPrompt;
  }
}