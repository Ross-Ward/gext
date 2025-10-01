import { GitDiffService } from './services/git-diff.service';
import { ConsoleOutputService } from './services/console-output.service';
import { CommandRunnerService } from './services/command-runner.service';
import { ConfigService } from './services/config.service';

export class App {
  private gitDiffService: GitDiffService;
  private console: ConsoleOutputService;
  private commandRunner: CommandRunnerService;

  constructor() {
    const configService = new ConfigService();
    const config = configService.loadConfig();
    
    this.console = new ConsoleOutputService();
    this.commandRunner = new CommandRunnerService();
    this.gitDiffService = new GitDiffService(
      this.commandRunner,
      config.git,
      config.ai
    );
  }

  async run(): Promise<void> {
    this.console.writeInfo('Starting Gext application...');

    try {
      // Step 1: Check if we have staged changes, if not add all changes
      const initialDiffResult = await this.gitDiffService.getDiff();
      if (initialDiffResult.isError) {
        this.console.writeInfo('No staged changes found, adding all changes (git add .)...');
        const addResult = await this.gitDiffService.addAll();
        if (addResult.isError) {
          this.console.writeError(`Failed to add changes: ${addResult.error}`);
          process.exit(1);
        }
        this.console.writeSuccess('All changes staged successfully');
      } else {
        this.console.writeInfo('Using existing staged changes...');
      }

      // Step 2: Get the diff
      this.console.writeInfo('Getting staged diff...');
      const diffResult = await this.gitDiffService.getDiff();
      if (diffResult.isError) {
        this.console.writeWarning('No changes to commit');
        return;
      }

      this.console.writeSuccess('Git diff retrieved successfully');
      this.console.writeDebug(`Git diff output: ${diffResult.value}`);

      // Step 3: Generate AI commit message
      this.console.writeInfo('Generating AI commit message...');
      const summaryResult = await this.gitDiffService.getDiffSummary();
      
      if (summaryResult.isError) {
        this.console.writeError(`Failed to generate commit message: ${summaryResult.error}`);
        process.exit(1);
      }

      // Display the generated commit message
      this.console.writeCommitMessage(summaryResult.value);

      // Step 4: Commit with AI message
      this.console.writeInfo('Committing changes...');
      const commitResult = await this.gitDiffService.commit(summaryResult.value);
      if (commitResult.isError) {
        this.console.writeError(`Failed to commit: ${commitResult.error}`);
        process.exit(1);
      }
      this.console.writeSuccess('Changes committed successfully');

      // Step 5: Push to remote
      this.console.writeInfo('Pushing to remote repository...');
      const pushResult = await this.gitDiffService.push();
      if (pushResult.isError) {
        this.console.writeWarning(`Failed to push: ${pushResult.error}`);
        this.console.writeInfo('You may need to run "git push" manually');
      } else {
        this.console.writeSuccess('Changes pushed to remote successfully');
      }
      
      this.console.writeSuccess('🎉 Gext workflow completed successfully!');
    } catch (error) {
      this.console.writeError(`An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exit(1);
    }
  }
}