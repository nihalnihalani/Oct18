/**
 * Custom hook for image generation logic
 */

import { useState, useCallback } from 'react';
import { generateImage, imageToDataUrl, getDefaultImageModel } from '../services/imageService';
import { showError, logError } from '../utils/errorHandler';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';
import type { GalleryItem } from '../types';

export interface UseImageGenerationOptions {
  onImageGenerated?: (dataUrl: string) => void;
  onAddToGallery?: (item: Omit<GalleryItem, 'id' | 'createdAt'>) => void;
}

export function useImageGeneration(options: UseImageGenerationOptions = {}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imagenBusy, setImagenBusy] = useState(false);

  /**
   * Generate image with Imagen
   */
  const generateWithImagen = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    setImagenBusy(true);
    setGeneratedImage(null);

    try {
      const response = await generateImage({ prompt });
      const dataUrl = imageToDataUrl(response);

      if (dataUrl) {
        setGeneratedImage(dataUrl);
        
        // Add to gallery
        if (options.onAddToGallery) {
          options.onAddToGallery({
            type: 'image',
            src: dataUrl,
            prompt,
            model: getDefaultImageModel(),
          });
        }

        if (options.onImageGenerated) {
          options.onImageGenerated(dataUrl);
        }

        alert(SUCCESS_MESSAGES.IMAGE_GENERATED);
      } else {
        throw new Error('No image data received from server');
      }
    } catch (error) {
      logError(error, 'Image Generation');
      showError(error, 'Image generation failed');
    } finally {
      setImagenBusy(false);
    }
  }, [options]);

  /**
   * Handle image file selection
   */
  const onPickImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setGeneratedImage(null);
    }
  }, []);

  /**
   * Close generated image
   */
  const closeGeneratedImage = useCallback(() => {
    setGeneratedImage(null);
  }, []);

  /**
   * Reset image state
   */
  const resetImageState = useCallback(() => {
    setImageFile(null);
    setGeneratedImage(null);
    setImagenBusy(false);
  }, []);

  return {
    // State
    imageFile,
    generatedImage,
    imagenBusy,
    
    // Actions
    generateWithImagen,
    onPickImage,
    closeGeneratedImage,
    resetImageState,
    setImageFile,
    setGeneratedImage,
  };
}

