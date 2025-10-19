/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unified Composer with Complete Media Support
 */
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowRight,
  RotateCcw,
  X,
  Images,
  Image as ImageIcon,
  Film,
  Layers,
  ChevronDown,
  Sparkles,
  Settings,
  Palette,
} from "lucide-react";
import ModelSelector from "@/components/ui/ModelSelector";
import ModelInfoCard from "@/components/ui/ModelInfoCard";
import { 
  ImageDropZone, 
  ImageUploadBox, 
  FramesUploadPanel, 
  ReferencesUploadPanel,
  VideoUploadBox 
} from "@/components/ui/MediaUploadPanel";
import { useVideoGeneration } from "@/contexts/VideoGenerationContext";
import { useGallery } from "@/contexts/GalleryContext";
import { GenerationMode, VeoModel, AspectRatio, Resolution, ImageFile } from "@/types";

const modeIcons = {
  [GenerationMode.TEXT_TO_VIDEO]: Sparkles,
  [GenerationMode.IMAGE_TO_VIDEO]: ImageIcon,
  [GenerationMode.FRAMES_TO_VIDEO]: Layers,
  [GenerationMode.REFERENCES_TO_VIDEO]: Palette,
  [GenerationMode.EXTEND_VIDEO]: Film,
};

const modeDescriptions = {
  [GenerationMode.TEXT_TO_VIDEO]: "Generate videos from text descriptions",
  [GenerationMode.IMAGE_TO_VIDEO]: "Transform images into dynamic videos",
  [GenerationMode.FRAMES_TO_VIDEO]: "Interpolate motion between start and end frames",
  [GenerationMode.REFERENCES_TO_VIDEO]: "Use reference images for consistent characters and style",
  [GenerationMode.EXTEND_VIDEO]: "Continue an existing video (720p only)",
};

export default function UnifiedComposer() {
  const {
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
    isLooping,
    setIsLooping,
    state,
    startGeneration,
    resetAll,
    canGenerate,
  } = useVideoGeneration();

  const { setIsOpen: setGalleryOpen, items: galleryItems } = useGallery();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imagenBusy, setImagenBusy] = useState(false);

  const modeSelectorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  // Close mode selector on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modeSelectorRef.current && !modeSelectorRef.current.contains(event.target as Node)) {
        setShowModeSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-adjust settings based on mode
  useEffect(() => {
    if (generationMode === GenerationMode.REFERENCES_TO_VIDEO) {
      // References mode requires specific settings
      setAspectRatio(AspectRatio.LANDSCAPE);
      setResolution(Resolution.P720);
    } else if (generationMode === GenerationMode.EXTEND_VIDEO) {
      setResolution(Resolution.P720);
    }
  }, [generationMode, setAspectRatio, setResolution]);

  const handleModeChange = (mode: GenerationMode) => {
    setGenerationMode(mode);
    setShowModeSelector(false);
    // Reset media when mode changes
    setImageFile(null);
    setStartFrame(null);
    setEndFrame(null);
    setReferenceImages([]);
    setStyleImage(null);
    setInputVideo(null);
    setIsLooping(false);
  };

  const generateWithImagen = useCallback(async () => {
    if (!imagePrompt.trim()) return;
    
    setImagenBusy(true);
    try {
      const resp = await fetch("/api/imagen/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      
      if (!resp.ok) {
        throw new Error('Image generation failed');
      }
      
      const json = await resp.json();
      
      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        const blob = await fetch(dataUrl).then(r => r.blob());
        const file = new File([blob], 'generated-image.png', { type: blob.type });
        
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          setImageFile({
            file,
            base64,
            preview: result,
          });
          setImagePrompt("");
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Image generation error:', error);
      alert('Image generation failed. Please try again.');
    } finally {
      setImagenBusy(false);
    }
  }, [imagePrompt, setImageFile]);

  const renderMediaPanel = () => {
    if (generationMode === GenerationMode.IMAGE_TO_VIDEO) {
      return (
        <div className="mb-4 rounded-3xl backdrop-blur-xl bg-gray-800/90 shadow-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Image to Video</h3>
                <p className="text-xs text-gray-400">Upload or generate an image to animate</p>
              </div>
            </div>
            <button
              onClick={() => setGenerationMode(GenerationMode.TEXT_TO_VIDEO)}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-all"
              title="Close and switch to Text mode"
            >
              <X className="w-4 h-4 text-gray-300" />
            </button>
          </div>
          
          <ImageDropZone
            onImageSelect={setImageFile}
            onImageGenerate={generateWithImagen}
            imagePrompt={imagePrompt}
            setImagePrompt={setImagePrompt}
            imagenBusy={imagenBusy}
            currentImage={imageFile}
            onRemoveImage={() => setImageFile(null)}
          />
        </div>
      );
    }

    if (generationMode === GenerationMode.FRAMES_TO_VIDEO) {
      return (
        <div className="mb-4 rounded-3xl backdrop-blur-xl bg-gray-800/90 shadow-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Frames to Video</h3>
                <p className="text-xs text-gray-400">Interpolate smooth motion between frames</p>
              </div>
            </div>
            <button
              onClick={() => setGenerationMode(GenerationMode.TEXT_TO_VIDEO)}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 text-gray-300" />
            </button>
          </div>
          
          <FramesUploadPanel
            startFrame={startFrame}
            endFrame={endFrame}
            isLooping={isLooping}
            onStartFrameSelect={setStartFrame}
            onEndFrameSelect={setEndFrame}
            onStartFrameRemove={() => {
              setStartFrame(null);
              setIsLooping(false);
            }}
            onEndFrameRemove={() => setEndFrame(null)}
            onLoopingChange={setIsLooping}
          />
        </div>
      );
    }

    if (generationMode === GenerationMode.REFERENCES_TO_VIDEO) {
      return (
        <div className="mb-4 rounded-3xl backdrop-blur-xl bg-gray-800/90 shadow-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">References to Video</h3>
                <p className="text-xs text-gray-400">Use reference images for consistent style and content</p>
              </div>
            </div>
            <button
              onClick={() => setGenerationMode(GenerationMode.TEXT_TO_VIDEO)}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 text-gray-300" />
            </button>
          </div>
          
          <ReferencesUploadPanel
            referenceImages={referenceImages}
            styleImage={styleImage}
            onReferenceAdd={(img) => setReferenceImages([...referenceImages, img])}
            onReferenceRemove={(index) => setReferenceImages(referenceImages.filter((_, i) => i !== index))}
            onStyleImageSelect={setStyleImage}
            onStyleImageRemove={() => setStyleImage(null)}
          />
          
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-xs text-blue-400">
              ℹ️ This mode requires 720p and 16:9 aspect ratio (auto-configured)
            </p>
          </div>
        </div>
      );
    }

    if (generationMode === GenerationMode.EXTEND_VIDEO) {
      return (
        <div className="mb-4 rounded-3xl backdrop-blur-xl bg-gray-800/90 shadow-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Extend Video</h3>
                <p className="text-xs text-gray-400">Continue a previously generated 720p video</p>
              </div>
            </div>
            <button
              onClick={() => setGenerationMode(GenerationMode.TEXT_TO_VIDEO)}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 text-gray-300" />
            </button>
          </div>
          
          <div className="flex justify-center">
            <VideoUploadBox
              label={
                <>
                  Input Video<br />
                  (must be 720p Veo-generated)
                </>
              }
              video={inputVideo}
              onSelect={setInputVideo}
              onRemove={() => setInputVideo(null)}
            />
          </div>
          
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <p className="text-xs text-yellow-400">
              ⚠️ Only 720p videos generated by Veo can be extended. Resolution locked to 720p.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  const ModeIcon = modeIcons[generationMode];
  const isRefMode = generationMode === GenerationMode.REFERENCES_TO_VIDEO;
  const isExtendMode = generationMode === GenerationMode.EXTEND_VIDEO;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(100%,56rem)] px-4">
      {renderMediaPanel()}
      
      <div className="backdrop-blur-xl bg-gray-800/95 shadow-2xl rounded-3xl border border-gray-700/80 p-6">
        {/* Advanced Settings Panel */}
        {showAdvanced && (
          <div className="mb-4 p-4 bg-gray-900/50 rounded-2xl border border-gray-700 space-y-4 animate-fadeIn">
            {/* Enhanced Model Selector */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block font-medium">
                🤖 AI Model
              </label>
              <ModelSelector
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                compact={false}
              />
            </div>
            
            {/* Other Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">
                  📐 Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-white hover:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isRefMode || isExtendMode}
                >
                  <option value={AspectRatio.LANDSCAPE}>🖥️ Landscape (16:9) - Widescreen</option>
                  <option value={AspectRatio.PORTRAIT}>📱 Portrait (9:16) - Mobile</option>
                </select>
                {(isRefMode || isExtendMode) && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    ℹ️ Fixed to 16:9 for this mode
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">
                  🎥 Resolution
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as Resolution)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-white hover:border-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isRefMode || isExtendMode}
                >
                  <option value={Resolution.P720}>720p - Faster, supports extension</option>
                  <option value={Resolution.P1080}>1080p - Higher quality, larger files</option>
                </select>
                {resolution === Resolution.P1080 && !isRefMode && !isExtendMode && (
                  <p className="text-xs text-yellow-400 mt-1.5">
                    ⚠️ 1080p videos cannot be extended later
                  </p>
                )}
                {(isRefMode || isExtendMode) && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    ℹ️ Locked to 720p for this mode
                  </p>
                )}
              </div>
            </div>
            
            {/* Negative Prompt */}
            {!isExtendMode && (
              <div>
                <label className="text-xs text-gray-400 mb-2 block font-medium">
                  🚫 Negative Prompt (Optional)
                </label>
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="e.g., blurry, low quality, watermark, text, distorted..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 hover:border-purple-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Describe elements you want to avoid in the generated video
                </p>
              </div>
            )}
            
            {/* Model Info Card */}
            <ModelInfoCard selectedModel={selectedModel} />
          </div>
        )}

        {/* Main Controls Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {/* Mode Selector */}
            <div className="relative" ref={modeSelectorRef}>
              <button
                onClick={() => setShowModeSelector(!showModeSelector)}
                className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all font-medium"
                title="Change generation mode"
              >
                <ModeIcon className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">{generationMode}</span>
                <span className="text-xs sm:hidden">Mode</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showModeSelector ? 'rotate-180' : ''}`} />
              </button>
              
              {showModeSelector && (
                <div className="absolute bottom-full mb-2 left-0 w-72 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                  <div className="p-2 bg-gray-900/50 border-b border-gray-700">
                    <p className="text-xs text-gray-400 px-2">Select Generation Mode</p>
                  </div>
                  {Object.values(GenerationMode).filter(m => m !== GenerationMode.EXTEND_VIDEO).map((mode) => {
                    const Icon = modeIcons[mode];
                    const isSelected = generationMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => handleModeChange(mode)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-l-4 ${
                          isSelected ? 'bg-purple-500/10 border-purple-500' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-purple-400' : 'text-gray-400'}`} />
                          <div>
                            <div className={`text-sm font-semibold mb-0.5 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                              {mode}
                            </div>
                            <div className="text-xs text-gray-500">
                              {modeDescriptions[mode]}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Model Selector - Always Visible on Desktop */}
            <div className="hidden lg:block">
              <ModelSelector
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                compact={true}
              />
            </div>
            
            <button
              onClick={() => setGalleryOpen(true)}
              className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all font-medium"
              title="Open gallery"
            >
              <Images className="w-4 h-4" />
              <span className="text-sm hidden md:inline">Gallery</span>
              {galleryItems.length > 0 && (
                <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full font-semibold">
                  {galleryItems.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all font-medium ${
              showAdvanced 
                ? 'bg-purple-500 text-white shadow-lg' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
            title="Advanced settings & model selection"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm hidden md:inline">
              {showAdvanced ? 'Hide' : 'Settings'}
            </span>
          </button>
        </div>

        {/* Prompt Textarea */}
        <div className="mb-4">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              generationMode === GenerationMode.TEXT_TO_VIDEO
                ? "Describe the video you want to create... Be specific about scenes, actions, camera angles, lighting, and style."
                : generationMode === GenerationMode.IMAGE_TO_VIDEO
                ? "Describe the motion and action you want to see... How should the image come to life?"
                : generationMode === GenerationMode.FRAMES_TO_VIDEO
                ? "Describe the motion between frames (optional)... Camera movement, subject actions, transitions."
                : generationMode === GenerationMode.REFERENCES_TO_VIDEO
                ? "Describe the video using your reference images... What should happen, how should the camera move?"
                : "Describe what happens next in the video continuation..."
            }
            className="w-full bg-transparent focus:outline-none resize-none text-base font-normal placeholder-gray-400 text-white min-h-[60px] max-h-[200px]"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canGenerate() && !state.isGenerating) {
                e.preventDefault();
                startGeneration();
              }
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              {generationMode === GenerationMode.TEXT_TO_VIDEO && "Tip: Be specific about camera angles, lighting, and mood"}
              {generationMode === GenerationMode.IMAGE_TO_VIDEO && "Tip: Describe motion, camera movement, and transformations"}
              {generationMode === GenerationMode.FRAMES_TO_VIDEO && "Tip: Prompt is optional - AI will interpolate naturally"}
              {generationMode === GenerationMode.REFERENCES_TO_VIDEO && "Tip: Reference what elements from your images to use"}
              {generationMode === GenerationMode.EXTEND_VIDEO && "Tip: Describe the continuation or leave empty for natural extension"}
            </p>
            <span className="text-xs text-gray-500">
              {prompt.length} chars {prompt.length > 500 && '• Keep under 1000'}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={resetAll}
            className="h-12 w-12 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-xl transition-all hover:scale-105"
            title="Reset all settings"
          >
            <RotateCcw className="w-5 h-5 text-gray-300" />
          </button>

          <div className="flex items-center gap-3">
            {/* Validation Message */}
            {!canGenerate() && (
              <div className="hidden md:block text-sm text-gray-500 mr-2">
                {generationMode === GenerationMode.TEXT_TO_VIDEO && !prompt.trim() && "Enter a prompt to begin"}
                {generationMode === GenerationMode.IMAGE_TO_VIDEO && !imageFile && "Upload or generate an image"}
                {generationMode === GenerationMode.IMAGE_TO_VIDEO && !prompt.trim() && imageFile && "Describe the motion"}
                {generationMode === GenerationMode.FRAMES_TO_VIDEO && !startFrame && "Upload a start frame"}
                {generationMode === GenerationMode.REFERENCES_TO_VIDEO && referenceImages.length === 0 && "Add reference images"}
                {generationMode === GenerationMode.REFERENCES_TO_VIDEO && !prompt.trim() && referenceImages.length > 0 && "Describe the video"}
                {generationMode === GenerationMode.EXTEND_VIDEO && !inputVideo && "Upload a 720p Veo video"}
              </div>
            )}
            
            <button
              onClick={startGeneration}
              disabled={!canGenerate() || state.isGenerating}
              className={`h-12 px-8 flex items-center justify-center gap-2 rounded-xl font-semibold transition-all ${
                !canGenerate() || state.isGenerating
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
              }`}
              title={canGenerate() ? "Generate video (Ctrl/Cmd + Enter)" : "Complete required fields"}
            >
              {state.isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Generate Video</span>
                  <span className="sm:hidden">Generate</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Helper Text */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Ctrl/Cmd + Enter</kbd> to generate •{' '}
            <span className="text-purple-400">Settings</span> for model selection & advanced options
          </p>
        </div>
      </div>
    </div>
  );
}
