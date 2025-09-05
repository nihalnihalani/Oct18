"use client";

import React from "react";
import {
  Upload,
  Wand2,
  Plus,
  ArrowRight,
  Loader2,
  RotateCcw,
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 w-[min(100%,52rem)] px-4">
      {showImageTools && (
        <div className="mb-4 rounded-2xl backdrop-blur-md bg-white/90 shadow-xl border border-white/20 p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Image Input</h3>
              <div
                className={`rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "bg-blue-50 border-blue-400 scale-[1.02]"
                    : "bg-slate-50 border-slate-300 hover:bg-blue-50 hover:border-blue-300"
                }`}
                onClick={handleOpenFileDialog}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex items-center gap-4 text-slate-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-lg">
                      Drag & drop an image, or click to upload
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
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
                    className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  onClick={generateWithImagen}
                  disabled={!imagePrompt.trim() || imagenBusy}
                  aria-busy={imagenBusy}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    !imagePrompt.trim() || imagenBusy
                      ? "opacity-60 cursor-not-allowed bg-slate-200 text-slate-500"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
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
            </div>
            
            {(imageFile || generatedImage) && (
              <div className="flex items-start justify-start">
                <div className="mt-2">
                  {imageFile && (
                    <div className="text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-lg">
                      Selected: {imageFile.name}
                    </div>
                  )}
                  {!imageFile && generatedImage && (
                    <NextImage
                      src={generatedImage}
                      alt="Generated"
                      width={320}
                      height={180}
                      className="max-h-48 rounded-xl border-2 border-white shadow-lg w-auto h-auto"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="backdrop-blur-md bg-white/90 shadow-xl rounded-2xl border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            aria-pressed={showImageTools}
            onClick={() => setShowImageTools((s) => !s)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              showImageTools
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            title="Image to Video"
          >
            <Plus className="w-4 h-4" />
            Image
          </button>

          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the video you want to create... Be specific about scenes, actions, and style."
          className="w-full bg-transparent focus:outline-none resize-none text-base font-normal placeholder-slate-400 min-h-[60px]"
          rows={2}
        />
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="h-12 w-12 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-xl transition-all hover:scale-105"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          
          <button
            onClick={startGeneration}
            disabled={!canStart || isGenerating}
            aria-busy={isGenerating}
            className={`h-12 w-12 flex items-center justify-center rounded-xl font-medium transition-all ${
              !canStart || isGenerating
                ? "bg-slate-200 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
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
