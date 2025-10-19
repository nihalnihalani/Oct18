/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unified Veo Studio with Gallery - Main Page
 */
"use client";

import React, { useEffect, useCallback } from "react";
import { X, Images } from "lucide-react";
import { Video } from "@google/genai";
import UnifiedComposer from "@/components/ui/UnifiedComposer";
import VideoPlayer from "@/components/ui/VideoPlayer";
import VeoGallery from "@/components/ui/VeoGallery";
import { VideoGenerationProvider, useVideoGeneration } from "@/contexts/VideoGenerationContext";
import { GalleryProvider, useGallery } from "@/contexts/GalleryContext";

const POLL_INTERVAL_MS = 5000;

function VeoStudioContent() {
  const {
    state,
    videoUrl,
    setVideoUrl,
    videoBlobRef,
    prompt,
    selectedModel,
    generationMode,
    setGenerationComplete,
  } = useVideoGeneration();

  const {
    addItem,
    deleteItem,
    downloadItem,
    isOpen: galleryIsOpen,
    setIsOpen: setGalleryOpen,
    items: galleryItems,
  } = useGallery();

  const [trimmedBlob, setTrimmedBlob] = React.useState<Blob | null>(null);
  const [trimmedUrl, setTrimmedUrl] = React.useState<string | null>(null);
  const [originalVideoUrl, setOriginalVideoUrl] = React.useState<string | null>(null);
  const [isPolling, setIsPolling] = React.useState(false);

  // Polling effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    
    async function poll() {
      if (!state.operationName || videoUrl || isPolling) return;
      
      setIsPolling(true);
      try {
        const resp = await fetch("/api/veo/operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: state.operationName }),
        });
        
        if (!resp.ok) {
          console.error("Polling request failed:", resp.status, resp.statusText);
          const errorData = await resp.json().catch(() => ({}));
          console.error("Error details:", errorData);
          setIsPolling(false);
          timer = setTimeout(poll, POLL_INTERVAL_MS);
          return;
        }
        
        const fresh = await resp.json();
        console.log("Polling response - done:", fresh.done);
        
        if (fresh?.done) {
          console.log("✅ Operation completed!");
          
          // CORRECT path based on actual Google API response
          let fileUri = 
            fresh?.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ||
            fresh?.response?.generatedVideos?.[0]?.video?.uri ||
            fresh?.response?.video?.uri;
          
          console.log("🎯 Extracted URI:", fileUri || "❌ NOT FOUND");
          
          if (fileUri) {
            console.log("✅ Video URI found:", fileUri);
          } else {
            console.error("❌ Could not find video URI in response");
            console.log("📦 Full response:", JSON.stringify(fresh, null, 2));
          }
          
          if (fileUri) {
            console.log("Starting video download...");
            try {
              const dl = await fetch("/api/veo/download", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ uri: fileUri }),
              });
              
              console.log("Download response status:", dl.status, dl.statusText);
              
              if (!dl.ok) {
                const errorText = await dl.text();
                console.error("Download failed:", errorText);
                alert(`Download failed: ${dl.status} ${dl.statusText}`);
                setIsPolling(false);
                setGenerationComplete();
                return;
              }
              
              const blob = await dl.blob();
              console.log("Downloaded blob:", blob.size, "bytes, type:", blob.type);
              
              videoBlobRef.current = blob;
              const url = URL.createObjectURL(blob);
              console.log("Created blob URL:", url);
              
              // Set video URL in context
              setVideoUrl(url);
              setOriginalVideoUrl(url);
              
              // Mark generation as complete
              setGenerationComplete();
              
              // Add to gallery
              await addItem({
                type: 'video',
                src: url,
                prompt: prompt,
                model: selectedModel,
                metadata: {
                  mode: generationMode,
                },
              });
              
              console.log("Video ready and added to gallery!");
            } catch (downloadError) {
              console.error("Download error:", downloadError);
              alert(`Failed to download video: ${downloadError instanceof Error ? downloadError.message : 'Unknown error'}`);
              setGenerationComplete();
            }
          } else {
            console.error("No video URI found in response");
            alert("Video generation completed but no URI found. Please try again.");
            setGenerationComplete();
          }
          setIsPolling(false);
          return;
        } else {
          // Still generating, continue polling
          setIsPolling(false);
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (e) {
        console.error("Polling error:", e);
        setIsPolling(false);
        // Continue polling on error
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }
    
    if (state.operationName && !videoUrl) {
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [state.operationName, videoUrl, isPolling, addItem, prompt, selectedModel, generationMode, videoBlobRef, setVideoUrl, setGenerationComplete]);

  const closeVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    if (trimmedUrl) {
      URL.revokeObjectURL(trimmedUrl);
    }
    setVideoUrl(null);
    setTrimmedUrl(null);
    setTrimmedBlob(null);
    setOriginalVideoUrl(null);
  };

  const handleTrimmedOutput = (blob: Blob) => {
    setTrimmedBlob(blob);
    if (trimmedUrl) {
      URL.revokeObjectURL(trimmedUrl);
    }
    const url = URL.createObjectURL(blob);
    setTrimmedUrl(url);
    setVideoUrl(url);
  };

  const handleResetTrimState = () => {
    if (trimmedUrl) {
      URL.revokeObjectURL(trimmedUrl);
      setTrimmedUrl(null);
    }
    setTrimmedBlob(null);
    if (originalVideoUrl) {
      setVideoUrl(originalVideoUrl);
    }
  };

  const downloadVideo = async () => {
    const blob = trimmedBlob || videoBlobRef.current;
    if (!blob) return;
    
    const isTrimmed = !!trimmedBlob;
    const filename = isTrimmed ? "veo3_video_trimmed.webm" : "veo3_video.mp4";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEditFromGallery = async (item: any) => {
    console.log("Editing video:", item.prompt);
    // TODO: Implement regeneration
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
                  Veo 3 Studio Pro
                </h1>
                <p className="text-gray-400 text-sm">Next-Gen AI Video Creation</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setGalleryOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all backdrop-blur-sm border border-gray-700 hover:border-purple-500"
              >
                <Images className="w-4 h-4" />
                Gallery
                {galleryItems.length > 0 && (
                  <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                    {galleryItems.length}
                  </span>
                )}
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>API Connected</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - increased padding when video is shown */}
      <main className={`relative z-10 pt-8 transition-all duration-300 ${videoUrl ? 'pb-48' : 'pb-32'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!videoUrl ? (
            <div className="text-center py-20">
              {state.isGenerating || state.isDownloading ? (
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
                    {state.isGenerating ? "Creating Magic..." : "Preparing Your Video..."}
                  </h2>
                  <p className="text-gray-400 text-lg">
                    {state.isGenerating ? "Our AI is crafting your vision into reality" : "Almost ready to unveil your creation"}
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
                      Multiple generation modes for every creative need.
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
                      <h3 className="text-lg font-semibold mb-2">Multiple Modes</h3>
                      <p className="text-gray-400 text-sm">Text, Image, Frames, References - full creative control</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-red-500 transition-colors duration-300">
                      <div className="text-3xl mb-4">⚡</div>
                      <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                      <p className="text-gray-400 text-sm">Generate high-quality videos in minutes</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 mb-8">
              <div className="max-w-6xl mx-auto">
                <div className="flex justify-end mb-6">
                  <button
                    onClick={closeVideo}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/90 hover:bg-gray-700/90 text-gray-300 hover:text-white transition-all backdrop-blur-sm border border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <X className="w-4 h-4" />
                    Close Video
                  </button>
                </div>
                
                <div className="mb-12">
                  <VideoPlayer
                    src={videoUrl}
                    onOutputChanged={handleTrimmedOutput}
                    onDownload={downloadVideo}
                    onResetTrim={handleResetTrimState}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <UnifiedComposer />

      <VeoGallery
        isOpen={galleryIsOpen}
        onClose={() => setGalleryOpen(false)}
        galleryItems={galleryItems}
        onDeleteItem={deleteItem}
        onDownloadItem={downloadItem}
        onEditItem={handleEditFromGallery}
      />
    </div>
  );
}

export default function UnifiedVeoStudioPage() {
  return (
    <GalleryProvider>
      <VideoGenerationProvider>
        <VeoStudioContent />
      </VideoGenerationProvider>
    </GalleryProvider>
  );
}

