/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Media Upload Panel with Visual Previews
 */
'use client';

import React, { useRef } from 'react';
import { Plus, X, Upload, Wand2, Loader2 } from 'lucide-react';
import NextImage from 'next/image';
import { ImageFile, VideoFile } from '@/types';

// Image Upload Component with Canvas Preview
export const ImageUploadBox: React.FC<{
  onSelect: (image: ImageFile) => void;
  onRemove?: () => void;
  image?: ImageFile | null;
  label: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}> = ({ onSelect, onRemove, image, label, size = 'medium' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  const sizes = {
    small: 'w-24 h-20',
    medium: 'w-32 h-24',
    large: 'w-48 h-32',
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          onSelect({
            file,
            base64,
            preview: result,
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  if (image?.preview) {
    return (
      <div className={`relative ${sizes[size]} group`}>
        <div className="w-full h-full rounded-lg overflow-hidden border-2 border-gray-600 hover:border-purple-500 transition-colors">
          <NextImage
            src={image.preview}
            alt="preview"
            fill
            className="object-cover"
          />
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-white truncate">{image.file.name}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`${sizes[size]} bg-gray-800/50 hover:bg-gray-700/50 border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-white transition-all group`}
      >
        <Plus className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
        <span className="text-xs font-medium px-2 text-center">{label}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};

// Video Upload Component with Preview
export const VideoUploadBox: React.FC<{
  onSelect: (video: VideoFile) => void;
  onRemove?: () => void;
  video?: VideoFile | null;
  label: React.ReactNode;
}> = ({ onSelect, onRemove, video, label }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          onSelect({
            file,
            base64,
            preview: result,
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error converting file:', error);
      }
    }
  };

  if (video?.file) {
    const previewUrl = URL.createObjectURL(video.file);
    
    return (
      <div className="relative w-56 h-32 group">
        <div className="w-full h-full rounded-lg overflow-hidden border-2 border-gray-600 hover:border-purple-500 transition-colors">
          <video
            ref={videoRef}
            src={previewUrl}
            muted
            loop
            className="w-full h-full object-cover"
            onMouseEnter={() => videoRef.current?.play()}
            onMouseLeave={() => videoRef.current?.pause()}
          />
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Remove video"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-white truncate">{video.file.name}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-56 h-32 bg-gray-800/50 hover:bg-gray-700/50 border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-white transition-all group"
      >
        <Upload className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium px-4 text-center">{label}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};

// Drag and Drop Image Area with Canvas
export const ImageDropZone: React.FC<{
  onImageSelect: (image: ImageFile) => void;
  onImageGenerate: () => void;
  imagePrompt: string;
  setImagePrompt: (prompt: string) => void;
  imagenBusy: boolean;
  currentImage: ImageFile | null;
  onRemoveImage: () => void;
}> = ({
  onImageSelect,
  onImageGenerate,
  imagePrompt,
  setImagePrompt,
  imagenBusy,
  currentImage,
  onRemoveImage,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        onImageSelect({
          file,
          base64,
          preview: result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        onImageSelect({
          file,
          base64,
          preview: result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Canvas/Preview Area */}
      {currentImage?.preview ? (
        <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden border-2 border-purple-500 group">
          <NextImage
            src={currentImage.preview}
            alt="Selected image"
            fill
            className="object-contain"
          />
          <button
            onClick={onRemoveImage}
            className="absolute top-3 right-3 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title="Remove image"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-sm font-medium truncate">{currentImage.file.name}</p>
            <p className="text-gray-300 text-xs">
              {(currentImage.file.size / 1024 / 1024).toFixed(2)} MB • Ready for video generation
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`w-full aspect-video rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'bg-purple-500/20 border-purple-400 scale-[1.02]'
              : 'bg-gray-900/50 border-gray-600 hover:bg-purple-500/10 hover:border-purple-400'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Drag & drop your image here
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              or click to browse your files
            </p>
            <p className="text-xs text-gray-500">
              Supports PNG, JPG, WEBP up to 10MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Or Generate with AI */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-700"></div>
        <span className="text-xs text-gray-500 font-medium">OR GENERATE WITH AI</span>
        <div className="flex-1 h-px bg-gray-700"></div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          placeholder="Describe an image to generate with Imagen 4..."
          className="flex-1 rounded-xl bg-gray-900/50 border border-gray-600 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && imagePrompt.trim() && !imagenBusy) {
              e.preventDefault();
              onImageGenerate();
            }
          }}
        />
        <button
          onClick={onImageGenerate}
          disabled={!imagePrompt.trim() || imagenBusy}
          className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
            !imagePrompt.trim() || imagenBusy
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {imagenBusy ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Generate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Frames Upload Panel
export const FramesUploadPanel: React.FC<{
  startFrame: ImageFile | null;
  endFrame: ImageFile | null;
  isLooping: boolean;
  onStartFrameSelect: (image: ImageFile) => void;
  onEndFrameSelect: (image: ImageFile) => void;
  onStartFrameRemove: () => void;
  onEndFrameRemove: () => void;
  onLoopingChange: (looping: boolean) => void;
}> = ({
  startFrame,
  endFrame,
  isLooping,
  onStartFrameSelect,
  onEndFrameSelect,
  onStartFrameRemove,
  onEndFrameRemove,
  onLoopingChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 justify-center flex-wrap">
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2 font-medium">Start Frame *</p>
          <ImageUploadBox
            label="Start Frame"
            image={startFrame}
            onSelect={onStartFrameSelect}
            onRemove={onStartFrameRemove}
            size="large"
          />
        </div>
        
        {!isLooping && (
          <>
            <div className="flex items-center justify-center">
              <div className="w-12 h-px bg-purple-500"></div>
              <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-12 border-l-purple-500"></div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-2 font-medium">End Frame</p>
              <ImageUploadBox
                label="End Frame"
                image={endFrame}
                onSelect={onEndFrameSelect}
                onRemove={onEndFrameRemove}
                size="large"
              />
            </div>
          </>
        )}
      </div>
      
      {startFrame && !endFrame && (
        <div className="flex items-center justify-center gap-2 p-3 bg-gray-900/50 rounded-xl border border-gray-700">
          <input
            type="checkbox"
            id="looping-checkbox"
            checked={isLooping}
            onChange={(e) => onLoopingChange(e.target.checked)}
            className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
          />
          <label htmlFor="looping-checkbox" className="text-sm text-gray-300 cursor-pointer select-none">
            🔄 Create seamless looping video
          </label>
        </div>
      )}
      
      {isLooping && startFrame && (
        <div className="text-center p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <p className="text-sm text-purple-400">
            ✨ Looping mode: Video will seamlessly loop from start frame back to itself
          </p>
        </div>
      )}
    </div>
  );
};

// References Upload Panel
export const ReferencesUploadPanel: React.FC<{
  referenceImages: ImageFile[];
  styleImage: ImageFile | null;
  onReferenceAdd: (image: ImageFile) => void;
  onReferenceRemove: (index: number) => void;
  onStyleImageSelect: (image: ImageFile) => void;
  onStyleImageRemove: () => void;
}> = ({
  referenceImages,
  styleImage,
  onReferenceAdd,
  onReferenceRemove,
  onStyleImageSelect,
  onStyleImageRemove,
}) => {
  return (
    <div className="space-y-6">
      {/* Reference Images */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-white">Reference Images (Assets)</h4>
          <span className="text-xs text-gray-400">{referenceImages.length}/3 added</span>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          {referenceImages.map((img, index) => (
            <ImageUploadBox
              key={index}
              label=""
              image={img}
              onSelect={() => {}}
              onRemove={() => onReferenceRemove(index)}
              size="medium"
            />
          ))}
          {referenceImages.length < 3 && (
            <ImageUploadBox
              label={`Add Reference ${referenceImages.length + 1}`}
              onSelect={onReferenceAdd}
              size="medium"
            />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Upload images of characters, objects, or scenes you want to appear in the video
        </p>
      </div>

      {/* Style Image */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">Style Image (Optional)</h4>
        <div className="flex justify-center">
          <ImageUploadBox
            label="Add Style Reference"
            image={styleImage}
            onSelect={onStyleImageSelect}
            onRemove={onStyleImageRemove}
            size="medium"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Upload an image to define the artistic style (e.g., painting, photograph, cartoon)
        </p>
      </div>
    </div>
  );
};

