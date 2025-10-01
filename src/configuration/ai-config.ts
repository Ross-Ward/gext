export interface AIConfig {
  provider: 'openai' | 'ollama' | 'groq' | 'gemini';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  promptPath?: string;
}

export interface GitConfig {
  maxRecursiveDirectories: number;
  commitSignature?: string;
}

export interface AppConfig {
  ai: AIConfig;
  git: GitConfig;
}