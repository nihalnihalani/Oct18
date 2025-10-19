"use client";

import React, { useState, useMemo } from "react";
import { Mic, Images, X } from "lucide-react";

// Components
import Composer from "@/components/ui/Composer";
import VideoPlayer from "@/components/ui/VideoPlayer";
import VeoGallery from "@/components/ui/VeoGallery";
import VoiceSphere from "@/components/ui/VoiceSphere";
import AgentPanel from "@/components/ui/AgentPanel";

// Hooks
import { useVideoGeneration } from "@/lib/hooks/useVideoGeneration";
import { useImageGeneration } from "@/lib/hooks/useImageGeneration";
import { useGallery } from "@/lib/hooks/useGallery";

// Constants & Config
import { DEFAULT_MODEL, DEFAULT_ASPECT_RATIO } from "@/lib/constants";
import { config } from "@/lib/config";

const VeoStudio: React.FC = () => {
  // Basic state
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState(DEFAULT_ASPECT_RATIO);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [imagePrompt, setImagePrompt] = useState("");
  const [showImageTools, setShowImageTools] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(true);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  // Custom hooks
  const gallery = useGallery({
    onEditStart: (operationName) => {
      videoGen.closeVideo();
      // The operation will be picked up by the polling effect
    },
  });

  const imageGen = useImageGeneration({
    onAddToGallery: gallery.addToGallery,
  });

  const videoGen = useVideoGeneration({
    onAddToGallery: (item) => {
      gallery.addToGallery({
        ...item,
        prompt,
        model: selectedModel,
      });
    },
  });

  // Computed values
  const canStart = useMemo(() => {
    const hasPrompt = !!prompt.trim();
    const hasImage = !!(imageGen.imageFile || imageGen.generatedImage);
    const needsImage = showImageTools;
    return hasPrompt && (!needsImage || hasImage);
  }, [prompt, showImageTools, imageGen.imageFile, imageGen.generatedImage]);

  // Actions
  const resetAll = () => {
    setPrompt("");
    setNegativePrompt("");
    setAspectRatio(DEFAULT_ASPECT_RATIO);
    setImagePrompt("");
    setShowImageTools(false);
    imageGen.resetImageState();
    videoGen.closeVideo();
  };

  const startGeneration = () => {
    if (!canStart) return;
    
    videoGen.startGeneration({
      prompt,
      selectedModel,
      negativePrompt,
      aspectRatio,
      imageFile: imageGen.imageFile,
      generatedImage: imageGen.generatedImage,
      showImageTools,
    });
  };

  // Voice Agent handlers
  const handleVoiceGenerateVideo = (voicePrompt: string) => {
    setPrompt(voicePrompt);
    setShowImageTools(false);
    imageGen.setGeneratedImage(null);
    imageGen.setImageFile(null);
  };

  const handleVoiceGenerateImage = async (voicePrompt: string) => {
    setImagePrompt(voicePrompt);
    setShowImageTools(true);
    await imageGen.generateWithImagen(voicePrompt);
  };

  const handleVoiceEditVideo = async (voicePrompt: string, videoId?: string) => {
    if (videoId) {
      const videoItem = gallery.galleryItems.find(item => item.id === videoId);
      if (videoItem) {
        const updatedItem = { ...videoItem, prompt: voicePrompt };
        await gallery.editFromGallery(updatedItem);
      }
    } else if (videoGen.videoUrl) {
      setPrompt(voicePrompt);
      await startGeneration();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">V3</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Veo 3 Studio
                </h1>
                <p className="text-gray-400 text-sm">Next-Gen AI Video Creation</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              {config.features.voiceAgent && (
                <button
                  onClick={() => setShowVoiceAgent(!showVoiceAgent)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all backdrop-blur-sm shadow-lg"
                  title="Voice Agent"
                >
                  <Mic className="w-4 h-4" />
                  Voice Agent
                </button>
              )}
              
              {config.features.gallery && (
                <button
                  onClick={() => setShowGallery(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all backdrop-blur-sm border border-gray-700 hover:border-purple-500"
                  title="Product Gallery"
                >
                  <Images className="w-4 h-4" />
                  Product Gallery
                  {gallery.galleryItems.length > 0 && (
                    <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                      {gallery.galleryItems.length}
                    </span>
                  )}
                </button>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>API Connected</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Voice Agent Button */}
      {config.features.voiceAgent && (
        <div className="md:hidden fixed bottom-20 right-4 z-20">
          <button
            onClick={() => setShowVoiceAgent(!showVoiceAgent)}
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110"
            title="Voice Agent"
          >
            <Mic className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className={`relative z-10 pt-8 pb-32 transition-all duration-300 ${
        showVoiceAgent ? 'ml-80' : 'ml-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!videoGen.videoUrl ? (
            <div className="text-center py-20">
              {videoGen.isGenerating || videoGen.isDownloading ? (
                <div className="max-w-md mx-auto">
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto mb-8 relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin"></div>
                      <div className="absolute inset-2 rounded-full bg-gray-900 flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {videoGen.isGenerating ? "Creating Magic..." : "Preparing Your Video..."}
                  </h2>
                  <p className="text-gray-400 text-lg">
                    {videoGen.isGenerating ? "Our AI is crafting your vision into reality" : "Almost ready to unveil your creation"}
                  </p>
                  <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-200"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-400"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <div className="mb-12">
                    <div className="w-40 h-40 mx-auto mb-8 relative group">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-2 rounded-2xl bg-gray-900 flex items-center justify-center">
                        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">🎥</div>
                      </div>
                    </div>
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                      Create Cinematic Magic
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed mb-8">
                      Transform your ideas into stunning videos with Google's most advanced AI. 
                      From simple prompts to complex scenes, bring your imagination to life.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-colors duration-300">
                      <div className="text-3xl mb-4">✨</div>
                      <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
                      <p className="text-gray-400 text-sm">Advanced Veo 3 model for realistic video generation</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-pink-500 transition-colors duration-300">
                      <div className="text-3xl mb-4">🎨</div>
                      <h3 className="text-lg font-semibold mb-2">Creative Control</h3>
                      <p className="text-gray-400 text-sm">Customize aspect ratios, models, and visual styles</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-red-500 transition-colors duration-300">
                      <div className="text-3xl mb-4">⚡</div>
                      <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                      <p className="text-gray-400 text-sm">Generate high-quality videos in minutes, not hours</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8">
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-end mb-4">
                  <button
                    onClick={videoGen.closeVideo}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/90 hover:bg-gray-700/90 text-gray-300 hover:text-white transition-all backdrop-blur-sm border border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                    title="Close Video"
                  >
                    <X className="w-4 h-4" />
                    Close Video
                  </button>
                </div>
                
                <VideoPlayer
                  src={videoGen.videoUrl}
                  onOutputChanged={videoGen.handleTrimmedOutput}
                  onDownload={videoGen.downloadVideo}
                  onResetTrim={videoGen.handleResetTrimState}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <Composer
        prompt={prompt}
        setPrompt={setPrompt}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        canStart={canStart}
        isGenerating={videoGen.isGenerating}
        startGeneration={startGeneration}
        showImageTools={showImageTools}
        setShowImageTools={setShowImageTools}
        imagePrompt={imagePrompt}
        setImagePrompt={setImagePrompt}
        imagenBusy={imageGen.imagenBusy}
        onPickImage={imageGen.onPickImage}
        generateWithImagen={() => imageGen.generateWithImagen(imagePrompt)}
        imageFile={imageGen.imageFile}
        generatedImage={imageGen.generatedImage}
        resetAll={resetAll}
        closeGeneratedImage={imageGen.closeGeneratedImage}
        onOpenGallery={() => setShowGallery(true)}
        galleryItemCount={gallery.galleryItems.length}
      />

      {/* Veo Gallery */}
      {config.features.gallery && (
        <VeoGallery
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          galleryItems={gallery.galleryItems}
          onDeleteItem={gallery.deleteFromGallery}
          onDownloadItem={gallery.downloadFromGallery}
          onEditItem={gallery.editFromGallery}
        />
      )}

      {/* Voice Agent */}
      {config.features.voiceAgent && showVoiceAgent && (
        <VoiceSphere
          apiKey={config.geminiApiKeyPublic}
          onGenerateVideo={handleVoiceGenerateVideo}
          onGenerateImage={handleVoiceGenerateImage}
          onEditVideo={handleVoiceEditVideo}
          currentVideoId={currentVideoId}
          currentImagePrompt={imagePrompt}
        />
      )}
      
      {/* Agent Panel */}
      {config.features.agentPanel && showAgentPanel && (
        <AgentPanel
          currentPrompt={prompt}
          onOptimizePrompt={(optimized) => setPrompt(optimized)}
        />
      )}
    </div>
  );
};

export default VeoStudio;
