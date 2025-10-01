import { spawn } from 'child_process';
import { Result } from '../utils/result';

export class CommandRunnerService {
  async run(command: string, args: string[], workingDirectory: string): Promise<Result<string, string>> {
    return new Promise((resolve) => {
      const process = spawn(command, args, {
        cwd: workingDirectory,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(Result.ok(stdout + stderr));
        } else {
          resolve(Result.fail(stderr || `Command failed with exit code ${code}`));
        }
      });

      process.on('error', (error) => {
        resolve(Result.fail(`Failed to start command: ${error.message}`));
      });
    });
  }
}