/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unified types for Veo Studio + Gallery
 */
import { Video } from '@google/genai';

export enum AppState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum VeoModel {
  VEO_3_0 = 'veo-3.0-generate-preview',
  VEO_3_0_FAST = 'veo-3.0-fast-generate-preview',
  VEO_2_0 = 'veo-2.0-generate-001',
  VEO_3_1 = 'veo-3.1-generate-preview',
  VEO_3_1_FAST = 'veo-3.1-fast-generate-preview',
}

export enum AspectRatio {
  LANDSCAPE = '16:9',
  PORTRAIT = '9:16',
}

export enum Resolution {
  P720 = '720p',
  P1080 = '1080p',
}

export enum GenerationMode {
  TEXT_TO_VIDEO = 'Text to Video',
  IMAGE_TO_VIDEO = 'Image to Video',
  FRAMES_TO_VIDEO = 'Frames to Video',
  REFERENCES_TO_VIDEO = 'References to Video',
  EXTEND_VIDEO = 'Extend Video',
}

export interface ImageFile {
  file: File;
  base64: string;
  preview?: string;
}

export interface VideoFile {
  file: File;
  base64: string;
  preview?: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  prompt: string;
  model: string;
  createdAt: Date;
  thumbnail?: string;
  metadata?: {
    aspectRatio?: string;
    resolution?: string;
    mode?: GenerationMode;
  };
}

export interface GenerateVideoParams {
  prompt: string;
  model: VeoModel;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  mode: GenerationMode;
  negativePrompt?: string;
  // Image to Video mode
  image?: ImageFile | null;
  // Frames to Video mode
  startFrame?: ImageFile | null;
  endFrame?: ImageFile | null;
  isLooping?: boolean;
  // References to Video mode
  referenceImages?: ImageFile[];
  styleImage?: ImageFile | null;
  // Extend Video mode
  inputVideo?: VideoFile | null;
  inputVideoObject?: Video | null;
}

export interface VideoGenerationState {
  operationName: string | null;
  isGenerating: boolean;
  isDownloading: boolean;
  progress?: number;
  error?: string | null;
}

export interface GalleryState {
  items: GalleryItem[];
  selectedItem: GalleryItem | null;
  isOpen: boolean;
  filterType: 'all' | 'image' | 'video';
  sortBy: 'newest' | 'oldest' | 'type';
  viewMode: 'grid' | 'list';
}

