/**
 * Video Generation Service
 * Handles all video-related API calls
 */

import { API_ENDPOINTS } from '../constants';
import type { VideoGenerationRequest, VideoGenerationResponse } from '../types';
import { handleApiError, withErrorHandling } from '../utils/errorHandler';

/**
 * Start video generation
 */
export async function generateVideo(
  request: VideoGenerationRequest
): Promise<VideoGenerationResponse> {
  return withErrorHandling(async () => {
    const form = new FormData();
    form.append('prompt', request.prompt);
    form.append('model', request.model);
    
    if (request.negativePrompt) {
      form.append('negativePrompt', request.negativePrompt);
    }
    
    if (request.aspectRatio) {
      form.append('aspectRatio', request.aspectRatio);
    }

    if (request.imageFile) {
      form.append('imageFile', request.imageFile);
    } else if (request.imageBase64) {
      form.append('imageBase64', request.imageBase64);
      if (request.imageMimeType) {
        form.append('imageMimeType', request.imageMimeType);
      }
    }

    const response = await fetch(API_ENDPOINTS.VEO.GENERATE, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return await response.json();
  }, 'generateVideo');
}

/**
 * Check video generation operation status
 */
export async function checkVideoOperation(
  operationName: string
): Promise<VideoGenerationResponse> {
  return withErrorHandling(async () => {
    const response = await fetch(API_ENDPOINTS.VEO.OPERATION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: operationName }),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return await response.json();
  }, 'checkVideoOperation');
}

/**
 * Download generated video
 */
export async function downloadVideo(uri: string): Promise<Blob> {
  return withErrorHandling(async () => {
    const response = await fetch(API_ENDPOINTS.VEO.DOWNLOAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri }),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return await response.blob();
  }, 'downloadVideo');
}

/**
 * Regenerate video with new prompt
 */
export async function regenerateVideo(
  prompt: string,
  model: string
): Promise<VideoGenerationResponse> {
  return withErrorHandling(async () => {
    const response = await fetch(API_ENDPOINTS.VEO.REGENERATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model }),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return await response.json();
  }, 'regenerateVideo');
}

/**
 * Extract video URI from operation response
 */
export function extractVideoUri(response: VideoGenerationResponse): string | null {
  // Try multiple possible response structures
  const possiblePaths = [
    response?.response?.generatedVideos?.[0]?.video?.uri,
    response?.response?.video?.uri,
    response?.result?.generatedVideos?.[0]?.video?.uri,
    response?.result?.video?.uri,
  ];

  return possiblePaths.find(uri => uri) || null;
}

