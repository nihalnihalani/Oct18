/**
 * Application Configuration
 * Centralized environment variables and configuration
 */

export const config = {
  // API Keys
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiApiKeyPublic: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',

  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // API Configuration
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',

  // Feature Flags
  features: {
    voiceAgent: true,
    agentPanel: true,
    gallery: true,
    imageGeneration: true,
  },
} as const;

/**
 * Validate required environment variables
 */
export function validateConfig(): void {
  const required: Array<keyof typeof config> = [];
  
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0 && config.isDevelopment) {
    console.warn(
      `Missing configuration: ${missing.join(', ')}. ` +
      'Some features may not work correctly.'
    );
  }
}

/**
 * Get Gemini API key (prioritize server-side)
 */
export function getGeminiApiKey(): string {
  return config.geminiApiKey || config.geminiApiKeyPublic;
}

