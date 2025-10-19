/**
 * Custom hook for gallery management
 */

import { useState, useCallback } from 'react';
import { regenerateVideo } from '../services/videoService';
import { showError, logError } from '../utils/errorHandler';
import { MOCK_GALLERY_ITEMS } from '../mockGalleryItems';
import type { GalleryItem, VeoOperationName } from '../types';

export interface UseGalleryOptions {
  onEditStart?: (operationName: string) => void;
}

export function useGallery(options: UseGalleryOptions = {}) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    // Initialize with mock items
    return MOCK_GALLERY_ITEMS.map(item => ({
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    }));
  });

  /**
   * Add item to gallery
   */
  const addToGallery = useCallback((item: Omit<GalleryItem, 'id' | 'createdAt'>) => {
    const newItem: GalleryItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setGalleryItems(prev => [newItem, ...prev]);
  }, []);

  /**
   * Delete item from gallery
   */
  const deleteFromGallery = useCallback((id: string) => {
    setGalleryItems(prev => prev.filter(item => item.id !== id));
  }, []);

  /**
   * Download item from gallery
   */
  const downloadFromGallery = useCallback((item: GalleryItem) => {
    const link = document.createElement('a');
    link.href = item.src;
    link.download = `veo3_${item.type}_${item.id}.${item.type === 'image' ? 'png' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  /**
   * Edit/regenerate video from gallery
   */
  const editFromGallery = useCallback(async (item: GalleryItem) => {
    try {
      const response = await regenerateVideo(item.prompt, item.model);

      if (response?.name) {
        if (options.onEditStart) {
          options.onEditStart(response.name);
        }
      } else {
        throw new Error('No operation name received from server');
      }
    } catch (error) {
      logError(error, 'Video Regeneration');
      showError(error, 'Video regeneration failed');
    }
  }, [options]);

  return {
    // State
    galleryItems,
    
    // Actions
    addToGallery,
    deleteFromGallery,
    downloadFromGallery,
    editFromGallery,
    setGalleryItems,
  };
}

