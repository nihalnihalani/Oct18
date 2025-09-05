"use client";

import React from "react";
import {
  Upload,
  Wand2,
  Plus,
  ArrowRight,
  Loader2,
  RotateCcw,
  X,
  Images,
} from "lucide-react";
import NextImage from "next/image";
import ModelSelector from "@/components/ui/ModelSelector";

interface ComposerProps {
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
  
  // Gallery props
  onOpenGallery: () => void;
  galleryItemCount: number;
}

const Composer: React.FC<ComposerProps> = ({
  prompt,
  setPrompt,
  selectedModel,
  setSelectedModel,
  canStart,
  isGenerating,
  startGeneration,
  showImageTools,
  setShowImageTools,
  imagePrompt,
  setImagePrompt,
  imagenBusy,
  onPickImage,
  generateWithImagen,
  imageFile,
  generatedImage,
  resetAll,
  closeGeneratedImage,
  onOpenGallery,
  galleryItemCount,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onPickImage({
        target: { files },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleReset = () => {
    resetAll();
    setShowImageTools(false);
  };

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-20 w-[min(100%,52rem)] px-4">
      {showImageTools && (
        <div className="mb-4 rounded-3xl backdrop-blur-xl bg-gray-800/90 shadow-2xl border border-gray-700 p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🎨</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Image Enhancement</h3>
              </div>
              <button
                onClick={() => setShowImageTools(false)}
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all transform hover:scale-110"
                title="Close Image Enhancement"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div
              className={`rounded-2xl border-2 border-dashed p-6 cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "bg-purple-500/20 border-purple-400 scale-[1.02]"
                  : "bg-gray-900/50 border-gray-600 hover:bg-purple-500/10 hover:border-purple-400"
              }`}
              onClick={handleOpenFileDialog}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-medium text-lg">
                    Drag & drop an image, or click to upload
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    PNG, JPG, WEBP up to 10MB
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickImage}
              />
            </div>

            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the starting photo to generate..."
                  className="w-full rounded-xl bg-gray-900/50 border border-gray-600 px-4 py-3 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                onClick={() => {
                  console.log("Image generation button clicked!");
                  console.log("imagePrompt:", imagePrompt);
                  console.log("imagenBusy:", imagenBusy);
                  generateWithImagen();
                }}
                disabled={!imagePrompt.trim() || imagenBusy}
                aria-busy={imagenBusy}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  !imagePrompt.trim() || imagenBusy
                    ? "opacity-60 cursor-not-allowed bg-gray-700 text-gray-500"
                    : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                }`}
              >
                {imagenBusy ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5" />
                )}
                {imagenBusy ? "Generating" : "Generate"}
              </button>
            </div>
            
            {(imageFile || generatedImage) && (
              <div className="flex items-start justify-start">
                <div className="mt-2 relative">
                  {imageFile && (
                    <div className="text-sm text-purple-400 bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-700">
                      Selected: {imageFile.name}
                    </div>
                  )}
                  {!imageFile && generatedImage && (
                    <div className="relative inline-block">
                      <NextImage
                        src={generatedImage}
                        alt="Generated"
                        width={320}
                        height={180}
                        className="max-h-48 rounded-xl border-2 border-gray-600 shadow-lg w-auto h-auto"
                      />
                      <button
                        onClick={closeGeneratedImage}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform hover:scale-110"
                        title="Close Image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="backdrop-blur-xl bg-gray-800/90 shadow-2xl rounded-3xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-pressed={showImageTools}
              onClick={() => setShowImageTools((s) => !s)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                showImageTools
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              title="Image to Video"
            >
              <Plus className="w-4 h-4" />
              Image
            </button>
            
            <button
              onClick={onOpenGallery}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all font-medium"
              title="Product Gallery"
            >
              <Images className="w-4 h-4" />
              Gallery
              {galleryItemCount > 0 && (
                <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                  {galleryItemCount}
                </span>
              )}
            </button>
          </div>

          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the video you want to create... Be specific about scenes, actions, and style."
          className="w-full bg-transparent focus:outline-none resize-none text-base font-normal placeholder-gray-400 text-white min-h-[60px]"
          rows={2}
        />
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="h-12 w-12 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-xl transition-all hover:scale-105"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5 text-gray-300" />
            </button>
          </div>
          
          <button
            onClick={startGeneration}
            disabled={!canStart || isGenerating}
            aria-busy={isGenerating}
            className={`h-12 w-12 flex items-center justify-center rounded-xl font-medium transition-all ${
              !canStart || isGenerating
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            }`}
            title="Generate"
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Composer;
