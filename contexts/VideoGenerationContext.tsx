/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unified state management for video generation
 */
'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Video } from '@google/genai';
import {
  GenerateVideoParams,
  GenerationMode,
  VeoModel,
  AspectRatio,
  Resolution,
  ImageFile,
  VideoFile,
  VideoGenerationState,
} from '@/types';

interface VideoGenerationContextType {
  // Generation parameters
  prompt: string;
  setPrompt: (prompt: string) => void;
  negativePrompt: string;
  setNegativePrompt: (prompt: string) => void;
  selectedModel: VeoModel;
  setSelectedModel: (model: VeoModel) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  resolution: Resolution;
  setResolution: (resolution: Resolution) => void;
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;

  // Media inputs
  imageFile: ImageFile | null;
  setImageFile: (file: ImageFile | null) => void;
  startFrame: ImageFile | null;
  setStartFrame: (file: ImageFile | null) => void;
  endFrame: ImageFile | null;
  setEndFrame: (file: ImageFile | null) => void;
  referenceImages: ImageFile[];
  setReferenceImages: (files: ImageFile[]) => void;
  styleImage: ImageFile | null;
  setStyleImage: (file: ImageFile | null) => void;
  inputVideo: VideoFile | null;
  setInputVideo: (file: VideoFile | null) => void;
  inputVideoObject: Video | null;
  setInputVideoObject: (video: Video | null) => void;
  isLooping: boolean;
  setIsLooping: (looping: boolean) => void;

  // Generation state
  state: VideoGenerationState;
  videoUrl: string | null;
  setVideoUrl: (url: string | null) => void;
  videoBlobRef: React.MutableRefObject<Blob | null>;
  
  // Actions
  startGeneration: () => Promise<void>;
  setGenerationComplete: () => void;
  resetAll: () => void;
  canGenerate: () => boolean;
}

const VideoGenerationContext = createContext<VideoGenerationContextType | null>(null);

export const useVideoGeneration = () => {
  const context = useContext(VideoGenerationContext);
  if (!context) {
    throw new Error('useVideoGeneration must be used within VideoGenerationProvider');
  }
  return context;
};

interface VideoGenerationProviderProps {
  children: ReactNode;
  onVideoGenerated?: (videoUrl: string, blob: Blob, params: GenerateVideoParams) => void;
}

export const VideoGenerationProvider: React.FC<VideoGenerationProviderProps> = ({
  children,
  onVideoGenerated,
}) => {
  // Generation parameters
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<VeoModel>(VeoModel.VEO_3_0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.LANDSCAPE);
  const [resolution, setResolution] = useState<Resolution>(Resolution.P720);
  const [generationMode, setGenerationMode] = useState<GenerationMode>(GenerationMode.TEXT_TO_VIDEO);

  // Media inputs
  const [imageFile, setImageFile] = useState<ImageFile | null>(null);
  const [startFrame, setStartFrame] = useState<ImageFile | null>(null);
  const [endFrame, setEndFrame] = useState<ImageFile | null>(null);
  const [referenceImages, setReferenceImages] = useState<ImageFile[]>([]);
  const [styleImage, setStyleImage] = useState<ImageFile | null>(null);
  const [inputVideo, setInputVideo] = useState<VideoFile | null>(null);
  const [inputVideoObject, setInputVideoObject] = useState<Video | null>(null);
  const [isLooping, setIsLooping] = useState(false);

  // Generation state
  const [state, setState] = useState<VideoGenerationState>({
    operationName: null,
    isGenerating: false,
    isDownloading: false,
    error: null,
  });
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoBlobRef = React.useRef<Blob | null>(null);

  const setGenerationComplete = useCallback(() => {
    setState(prev => ({
      ...prev,
      isGenerating: false,
      isDownloading: false,
      operationName: null,
    }));
  }, []);

  const canGenerate = useCallback(() => {
    switch (generationMode) {
      case GenerationMode.TEXT_TO_VIDEO:
        return !!prompt.trim();
      case GenerationMode.IMAGE_TO_VIDEO:
        return !!prompt.trim() && !!imageFile;
      case GenerationMode.FRAMES_TO_VIDEO:
        return !!startFrame;
      case GenerationMode.REFERENCES_TO_VIDEO:
        return !!prompt.trim() && referenceImages.length > 0;
      case GenerationMode.EXTEND_VIDEO:
        return !!inputVideoObject;
      default:
        return false;
    }
  }, [generationMode, prompt, imageFile, startFrame, referenceImages, inputVideoObject]);

  const startGeneration = useCallback(async () => {
    if (!canGenerate()) return;

    setState({
      operationName: null,
      isGenerating: true,
      isDownloading: false,
      error: null,
    });

    try {
      console.log('Starting server-side generation');
      const form = new FormData();
      form.append('prompt', prompt);
      form.append('model', selectedModel);
      form.append('aspectRatio', aspectRatio);
      form.append('resolution', resolution);
      form.append('mode', generationMode);
      if (negativePrompt) form.append('negativePrompt', negativePrompt);

      // Add media based on mode
      if (generationMode === GenerationMode.IMAGE_TO_VIDEO && imageFile) {
        form.append('imageFile', imageFile.file);
        form.append('imageBase64', imageFile.base64);
        form.append('imageMimeType', imageFile.file.type);
      } else if (generationMode === GenerationMode.FRAMES_TO_VIDEO) {
        if (startFrame) {
          form.append('startFrame', startFrame.file);
          form.append('startFrameBase64', startFrame.base64);
        }
        if (endFrame) {
          form.append('endFrame', endFrame.file);
          form.append('endFrameBase64', endFrame.base64);
        }
        if (isLooping) form.append('isLooping', 'true');
      } else if (generationMode === GenerationMode.REFERENCES_TO_VIDEO) {
        referenceImages.forEach((img, index) => {
          form.append(`referenceImage${index}`, img.file);
          form.append(`referenceImage${index}Base64`, img.base64);
        });
        if (styleImage) {
          form.append('styleImage', styleImage.file);
          form.append('styleImageBase64', styleImage.base64);
        }
      } else if (generationMode === GenerationMode.EXTEND_VIDEO) {
        if (inputVideoObject) {
          form.append('inputVideoUri', inputVideoObject.uri);
        } else if (inputVideo) {
          form.append('inputVideoBase64', inputVideo.base64);
        }
      }

      const resp = await fetch('/api/veo/generate', {
        method: 'POST',
        body: form,
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Failed to start generation');
      }

      const json = await resp.json();
      console.log('Generation started, operation name:', json?.name);
      
      if (json?.name) {
        setState(prev => ({ ...prev, operationName: json.name, isGenerating: true }));
      } else {
        throw new Error('No operation name received');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setState({
        operationName: null,
        isGenerating: false,
        isDownloading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      alert(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [
    canGenerate,
    prompt,
    selectedModel,
    aspectRatio,
    resolution,
    generationMode,
    negativePrompt,
    imageFile,
    startFrame,
    endFrame,
    isLooping,
    referenceImages,
    styleImage,
    inputVideoObject,
    inputVideo,
  ]);

  const resetAll = useCallback(() => {
    setPrompt('');
    setNegativePrompt('');
    setSelectedModel(VeoModel.VEO_3_0);
    setAspectRatio(AspectRatio.LANDSCAPE);
    setResolution(Resolution.P720);
    setGenerationMode(GenerationMode.TEXT_TO_VIDEO);
    setImageFile(null);
    setStartFrame(null);
    setEndFrame(null);
    setReferenceImages([]);
    setStyleImage(null);
    setInputVideo(null);
    setInputVideoObject(null);
    setIsLooping(false);
    setState({
      operationName: null,
      isGenerating: false,
      isDownloading: false,
      error: null,
    });
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    videoBlobRef.current = null;
  }, [videoUrl]);

  const value: VideoGenerationContextType = {
    prompt,
    setPrompt,
    negativePrompt,
    setNegativePrompt,
    selectedModel,
    setSelectedModel,
    aspectRatio,
    setAspectRatio,
    resolution,
    setResolution,
    generationMode,
    setGenerationMode,
    imageFile,
    setImageFile,
    startFrame,
    setStartFrame,
    endFrame,
    setEndFrame,
    referenceImages,
    setReferenceImages,
    styleImage,
    setStyleImage,
    inputVideo,
    setInputVideo,
    inputVideoObject,
    setInputVideoObject,
    isLooping,
    setIsLooping,
    state,
    videoUrl,
    setVideoUrl,
    videoBlobRef,
    startGeneration,
    setGenerationComplete,
    resetAll,
    canGenerate,
  };

  return (
    <VideoGenerationContext.Provider value={value}>
      {children}
    </VideoGenerationContext.Provider>
  );
};

