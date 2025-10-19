/**
 * Custom hook for video generation logic
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { POLL_INTERVAL_MS, ERROR_MESSAGES, DEFAULT_MODEL } from '../constants';
import { 
  generateVideo, 
  checkVideoOperation, 
  downloadVideo, 
  extractVideoUri 
} from '../services/videoService';
import { showError, logError } from '../utils/errorHandler';
import type { VeoOperationName, GalleryItem } from '../types';

export interface UseVideoGenerationOptions {
  onVideoReady?: (url: string, blob: Blob) => void;
  onAddToGallery?: (item: Omit<GalleryItem, 'id' | 'createdAt'>) => void;
}

export function useVideoGeneration(options: UseVideoGenerationOptions = {}) {
  const [operationName, setOperationName] = useState<VeoOperationName>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const videoBlobRef = useRef<Blob | null>(null);
  const trimmedBlobRef = useRef<Blob | null>(null);
  const trimmedUrlRef = useRef<string | null>(null);
  const originalVideoUrlRef = useRef<string | null>(null);

  /**
   * Start video generation
   */
  const startGeneration = useCallback(async (params: {
    prompt: string;
    selectedModel: string;
    negativePrompt?: string;
    aspectRatio?: string;
    imageFile?: File | null;
    generatedImage?: string | null;
    showImageTools: boolean;
  }) => {
    setIsGenerating(true);
    setVideoUrl(null);

    try {
      const { prompt, selectedModel, negativePrompt, aspectRatio, imageFile, generatedImage, showImageTools } = params;

      let imageBase64: string | undefined;
      let imageMimeType: string | undefined;

      if (showImageTools && generatedImage && !imageFile) {
        const [meta, b64] = generatedImage.split(',');
        imageMimeType = meta?.split(';')?.[0]?.replace('data:', '') || 'image/png';
        imageBase64 = b64;
      }

      const response = await generateVideo({
        prompt,
        model: selectedModel,
        negativePrompt,
        aspectRatio,
        imageFile: imageFile || undefined,
        imageBase64,
        imageMimeType,
      });

      if (response?.name) {
        setOperationName(response.name);
      } else {
        throw new Error(ERROR_MESSAGES.NO_OPERATION_NAME);
      }
    } catch (error) {
      logError(error, 'Video Generation');
      showError(error, 'Video generation failed');
      setIsGenerating(false);
    }
  }, []);

  /**
   * Close video and cleanup
   */
  const closeVideo = useCallback(() => {
    setVideoUrl(null);
    if (videoBlobRef.current) {
      videoBlobRef.current = null;
    }
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
    originalVideoUrlRef.current = null;
  }, []);

  /**
   * Handle trimmed video output
   */
  const handleTrimmedOutput = useCallback((blob: Blob) => {
    trimmedBlobRef.current = blob;
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
    }
    trimmedUrlRef.current = URL.createObjectURL(blob);
    setVideoUrl(trimmedUrlRef.current);
  }, []);

  /**
   * Reset trim state
   */
  const handleResetTrimState = useCallback(() => {
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
    if (originalVideoUrlRef.current) {
      setVideoUrl(originalVideoUrlRef.current);
    }
  }, []);

  /**
   * Download video
   */
  const downloadVideoFile = useCallback(() => {
    const blob = trimmedBlobRef.current || videoBlobRef.current;
    if (!blob) return;
    
    const isTrimmed = !!trimmedBlobRef.current;
    const filename = isTrimmed ? 'veo3_video_trimmed.webm' : 'veo3_video.mp4';
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', filename);
    link.setAttribute('rel', 'noopener');
    link.target = '_self';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  }, []);

  /**
   * Poll operation status
   */
  useEffect(() => {
    if (!operationName || videoUrl) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    
    const poll = async () => {
      try {
        const response = await checkVideoOperation(operationName);
        
        if (response?.done) {
          const fileUri = extractVideoUri(response);
          
          if (fileUri) {
            setIsDownloading(true);
            const blob = await downloadVideo(fileUri);
            
            videoBlobRef.current = blob;
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            originalVideoUrlRef.current = url;
            
            // Add to gallery
            if (options.onAddToGallery) {
              options.onAddToGallery({
                type: 'video',
                src: url,
                prompt: '', // This should be passed from parent
                model: DEFAULT_MODEL,
              });
            }
            
            if (options.onVideoReady) {
              options.onVideoReady(url, blob);
            }
            
            setIsDownloading(false);
          } else {
            logError(new Error(ERROR_MESSAGES.NO_FILE_URI), 'Video Download');
          }
          
          setIsGenerating(false);
          return;
        }
      } catch (error) {
        logError(error, 'Video Polling');
        setIsGenerating(false);
      }
      
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    timer = setTimeout(poll, POLL_INTERVAL_MS);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [operationName, videoUrl, options]);

  return {
    // State
    operationName,
    isGenerating,
    isDownloading,
    videoUrl,
    videoBlobRef,
    trimmedBlobRef,
    trimmedUrlRef,
    originalVideoUrlRef,
    
    // Actions
    startGeneration,
    closeVideo,
    handleTrimmedOutput,
    handleResetTrimState,
    downloadVideo: downloadVideoFile,
  };
}

