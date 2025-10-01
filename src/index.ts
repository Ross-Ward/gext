#!/usr/bin/env node

import { Command } from 'commander';
import { App } from './app';
import { ConfigService } from './services/config.service';
import { AIServiceFactory } from './services/ai/ai-service.factory';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('gext')
  .description('A TypeScript application for automating Git operations with AI-powered commit messages')
  .version('1.0.0');

program
  .command('init')
  .description('Create a default configuration file')
  .action(() => {
    const configService = new ConfigService();
    configService.createDefaultConfigFile();
  });

program
  .command('providers')
  .description('List available AI providers')
  .action(() => {
    console.log('\n🤖 Available AI Providers:\n');
    
    const providers = AIServiceFactory.getProviderInfo();
    for (const [name, info] of Object.entries(providers)) {
      const freeLabel = info.free ? '🆓 Free' : '💰 Paid';
      const localLabel = info.local ? '🏠 Local' : '☁️  Cloud';
      
      console.log(`${name.padEnd(10)} ${freeLabel.padEnd(8)} ${localLabel.padEnd(8)} ${info.description}`);
    }
    
    console.log('\n💡 Recommended for beginners: ollama (completely free, runs locally)');
    console.log('💡 For fast results: groq (free tier, cloud-based)');
  });

// Default command - runs the full workflow
program
  .action(async () => {
    const app = new App();
    await app.run();
  });

program.parse();