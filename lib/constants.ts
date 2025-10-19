/**
 * Application Constants
 */

// Polling Configuration
export const POLL_INTERVAL_MS = 5000;

// Video Models
export const VEO_MODELS = {
  VEO_3: 'veo-3.0-generate-preview',
  VEO_3_FAST: 'veo-3.0-fast-generate-preview',
  VEO_2: 'veo-2.0-generate-preview',
} as const;

// Image Models
export const IMAGE_MODELS = {
  GEMINI_FLASH_IMAGE: 'gemini-2.5-flash-image-preview',
} as const;

// Aspect Ratios
export const ASPECT_RATIOS = ['16:9', '9:16', '1:1'] as const;

// Default Values
export const DEFAULT_MODEL = VEO_MODELS.VEO_3;
export const DEFAULT_ASPECT_RATIO = '16:9';

// File Upload Configuration
export const MAX_IMAGE_SIZE_MB = 10;
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// API Endpoints
export const API_ENDPOINTS = {
  VEO: {
    GENERATE: '/api/veo/generate',
    OPERATION: '/api/veo/operation',
    DOWNLOAD: '/api/veo/download',
    REGENERATE: '/api/veo/regenerate',
  },
  IMAGEN: {
    GENERATE: '/api/imagen/generate',
  },
  VOICE: {
    TRANSCRIBE: '/api/voice/transcribe',
  },
  GEMINI_LIVE: {
    CONNECT: '/api/gemini-live/connect',
    MESSAGE: '/api/gemini-live/message',
    STREAM: '/api/gemini-live/stream',
  },
} as const;

// Animation Delays
export const ANIMATION_DELAYS = {
  BLOB_1: '0ms',
  BLOB_2: '2000ms',
  BLOB_3: '4000ms',
} as const;

// Audio Configuration
export const AUDIO_CONFIG = {
  CHANNEL_COUNT: 1,
  SAMPLE_RATE: 16000,
  ECHO_CANCELLATION: true,
  NOISE_SUPPRESSION: true,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  VIDEO_GENERATION_FAILED: 'Video generation failed',
  IMAGE_GENERATION_FAILED: 'Image generation failed',
  NO_OPERATION_NAME: 'No operation name received from server',
  NO_FILE_URI: 'No file URI found in response',
  DOWNLOAD_FAILED: 'Failed to download video',
  CONNECTION_FAILED: 'Failed to connect',
  UNKNOWN_ERROR: 'Unknown error',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  IMAGE_GENERATED: 'Image generated successfully!',
  VIDEO_GENERATED: 'Video generated successfully!',
} as const;

