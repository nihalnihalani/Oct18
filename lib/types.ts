/**
 * Centralized Type Definitions
 */

// Gallery Types
export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  prompt: string;
  model: string;
  createdAt: Date;
  thumbnail?: string;
}

// Video Generation Types
export type VeoOperationName = string | null;

export interface VideoGenerationRequest {
  prompt: string;
  model: string;
  negativePrompt?: string;
  aspectRatio?: string;
  imageFile?: File;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface VideoGenerationResponse {
  name: string;
  done?: boolean;
  response?: {
    generatedVideos?: Array<{
      video?: {
        uri: string;
      };
    }>;
    video?: {
      uri: string;
    };
  };
  result?: {
    generatedVideos?: Array<{
      video?: {
        uri: string;
      };
    }>;
    video?: {
      uri: string;
    };
  };
}

// Image Generation Types
export interface ImageGenerationRequest {
  prompt: string;
}

export interface ImageGenerationResponse {
  image?: {
    imageBytes: string;
    mimeType: string;
  };
  error?: string;
}

// Voice Agent Types
export interface VoiceAgentCallbacks {
  onGenerateVideo: (prompt: string) => void;
  onGenerateImage: (prompt: string) => void;
  onEditVideo: (prompt: string, videoId?: string) => void;
}

// API Response Types
export interface ApiError {
  error: string;
  message?: string;
}

// Model Types
export type VeoModel = 
  | 'veo-3.0-generate-preview' 
  | 'veo-3.0-fast-generate-preview' 
  | 'veo-2.0-generate-preview';

export type AspectRatio = '16:9' | '9:16' | '1:1';

// Component Props Types
export interface ComposerProps {
  prompt: string;
  setPrompt: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  canStart: boolean;
  isGenerating: boolean;
  startGeneration: () => void;
  showImageTools: boolean;
  setShowImageTools: React.Dispatch<React.SetStateAction<boolean>>;
  imagePrompt: string;
  setImagePrompt: (value: string) => void;
  imagenBusy: boolean;
  onPickImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  generateWithImagen: () => Promise<void> | void;
  imageFile: File | null;
  generatedImage: string | null;
  resetAll: () => void;
  closeGeneratedImage: () => void;
  onOpenGallery: () => void;
  galleryItemCount: number;
}

export interface VideoPlayerProps {
  src: string;
  onOutputChanged: (blob: Blob) => void;
  onDownload: () => void;
  onResetTrim: () => void;
}

export interface VeoGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  galleryItems: GalleryItem[];
  onDeleteItem: (id: string) => void;
  onDownloadItem: (item: GalleryItem) => void;
  onEditItem: (item: GalleryItem) => void;
}

export interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

