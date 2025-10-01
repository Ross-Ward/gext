export class ConsoleOutputService {
  writeInfo(message: string): void {
    console.log(`ℹ️  ${message}`);
  }

  writeSuccess(message: string): void {
    console.log(`✅ ${message}`);
  }

  writeWarning(message: string): void {
    console.log(`⚠️  ${message}`);
  }

  writeError(message: string): void {
    console.error(`❌ ${message}`);
  }

  writeDebug(message: string): void {
    if (process.env.DEBUG) {
      console.log(`🐛 ${message}`);
    }
  }

  writeLine(message: string = ''): void {
    console.log(message);
  }

  writeCommitMessage(message: string): void {
    console.log('\n📝 Generated commit message:');
    console.log('─'.repeat(50));
    console.log(message);
    console.log('─'.repeat(50));
  }
}