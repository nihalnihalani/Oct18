/**
 * Image Generation Service
 * Handles all image-related API calls
 */

import { API_ENDPOINTS, IMAGE_MODELS } from '../constants';
import type { ImageGenerationRequest, ImageGenerationResponse } from '../types';
import { handleApiError, withErrorHandling } from '../utils/errorHandler';

/**
 * Generate image using Imagen
 */
export async function generateImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  return withErrorHandling(async () => {
    const response = await fetch(API_ENDPOINTS.IMAGEN.GENERATE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: request.prompt }),
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    return await response.json();
  }, 'generateImage');
}

/**
 * Convert image response to data URL
 */
export function imageToDataUrl(response: ImageGenerationResponse): string | null {
  if (!response.image?.imageBytes) {
    return null;
  }

  const mimeType = response.image.mimeType || 'image/png';
  return `data:${mimeType};base64,${response.image.imageBytes}`;
}

/**
 * Get default image model
 */
export function getDefaultImageModel(): string {
  return IMAGE_MODELS.GEMINI_FLASH_IMAGE;
}

