/**
 * CREATIVE STUDIO AI - Enhanced UI Version
 * Beautiful, clean integration with improved visibility
 */
"use client";

import React, { useState, useCallback, useEffect } from "react";
import { X, Images, Sparkles, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Video } from "@google/genai";
import { PipecatAppBase } from '@pipecat-ai/voice-ui-kit';
import UnifiedComposer from "@/components/ui/UnifiedComposer";
import VideoPlayer from "@/components/ui/VideoPlayer";
import VeoGallery from "@/components/ui/VeoGallery";
import VoicePanel from "@/components/voice/VoicePanel";
import { VideoGenerationProvider, useVideoGeneration } from "@/contexts/VideoGenerationContext";
import { GalleryProvider, useGallery } from "@/contexts/GalleryContext";
import '@pipecat-ai/voice-ui-kit/styles.scoped';

const POLL_INTERVAL_MS = 5000;

function VeoStudioContent({ handleConnect, handleDisconnect }: any) {
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
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [voiceContext, setVoiceContext] = useState('');
  const [voicePanelCollapsed, setVoicePanelCollapsed] = useState(false);

  // Update prompt when voice context changes
  useEffect(() => {
    if (voiceContext && generationPrompt) {
      // Merge voice context with generation prompt
      setGenerationPrompt(generationPrompt);
    }
  }, [voiceContext, generationPrompt]);

  // Polling effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    
    async function poll() {
      if (state !== 'generating' || !generationMode.operationName) {
        setIsPolling(false);
        return;
      }

      try {
        const pollResp = await fetch('/api/veo/operation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: generationMode.operationName }),
        });

        const pollData = await pollResp.json();

        if (pollData.done) {
          setIsPolling(false);
          
          if (pollData.response?.generatedVideos?.[0]) {
            const videoItem = pollData.response.generatedVideos[0];
            const videoData = videoItem.video || videoItem.generatedVideo;
            
            if (videoData?.uri) {
              const downloadResp = await fetch('/api/veo/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uri: videoData.uri }),
              });

              if (downloadResp.ok) {
                const videoBlob = await downloadResp.blob();
                const blobUrl = URL.createObjectURL(videoBlob);
                setVideoUrl(blobUrl);
                videoBlobRef.current = videoBlob;
                setOriginalVideoUrl(blobUrl);
                setGenerationComplete();

                // Add to gallery
                addItem({
                  url: blobUrl,
                  prompt: prompt,
                  type: 'video',
                  model: selectedModel,
                  blob: videoBlob,
                });
              }
            }
          } else if (pollData.response?.generatedImages?.[0]) {
            const imageItem = pollData.response.generatedImages[0];
            const imageData = imageItem.image || imageItem.generatedImage;
            
            if (imageData?.uri) {
              const downloadResp = await fetch('/api/veo/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uri: imageData.uri }),
              });

              if (downloadResp.ok) {
                const imageBlob = await downloadResp.blob();
                const blobUrl = URL.createObjectURL(imageBlob);
                setVideoUrl(blobUrl);
                videoBlobRef.current = imageBlob;
                setGenerationComplete();

                // Add to gallery
                addItem({
                  url: blobUrl,
                  prompt: prompt,
                  type: 'image',
                  model: selectedModel,
                  blob: imageBlob,
                });
              }
            }
          }
        } else {
          timer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch (error) {
        console.error('Polling error:', error);
        setIsPolling(false);
      }
    }

    if (state === 'generating' && generationMode.operationName && !isPolling) {
      setIsPolling(true);
      poll();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [state, generationMode.operationName, isPolling]);

  // Handle voice commands with full context
  const handleVoiceCommand = useCallback((message: string, fullContext: string) => {
    const lower = message.toLowerCase();
    
    // Store the full conversation context
    setVoiceContext(fullContext);
    
    // Check if user wants to generate
    if (lower.includes('generate') || lower.includes('create that') || 
        lower.includes('make it') || (lower.includes('yes') && fullContext.length > 50)) {
      
      // Extract the most recent detailed description from the AI
      const aiMessages = fullContext.split('\n').filter(line => line.startsWith('AI:'));
      const lastAiMessage = aiMessages[aiMessages.length - 1] || '';
      
      // Look for vivid descriptions in the AI's response
      let extractedPrompt = '';
      
      // Try to find "Picture this:" or similar phrases
      if (lastAiMessage.includes('Picture this:') || lastAiMessage.includes('picture this:')) {
        const parts = lastAiMessage.split(/picture this:/i);
        if (parts.length > 1) {
          extractedPrompt = parts[1].split(/Does this|Sound good|Ready|Let me know/i)[0].trim();
        }
      }
      
      // Fallback: use the last substantial AI message
      if (!extractedPrompt && lastAiMessage.length > 50) {
        extractedPrompt = lastAiMessage.replace('AI:', '').trim();
        // Clean up conversational parts
        extractedPrompt = extractedPrompt.split(/\?/)[0].trim(); // Remove questions
      }
      
      // Final fallback: use user's message
      if (!extractedPrompt) {
        extractedPrompt = message.replace(/generate|create|make|yes|that|it/gi, '').trim();
      }
      
      console.log('🎨 Extracting prompt from conversation:', extractedPrompt);
      setGenerationPrompt(extractedPrompt);
      
    } else if (lower.includes('show') && (lower.includes('gallery') || lower.includes('my work'))) {
      setGalleryOpen(true);
    }
  }, [setGalleryOpen]);

  return (
    <div className="vkui-root voice-ui-kit">
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        {/* Enhanced Header */}
        <header className="border-b border-purple-500/30 bg-black/50 backdrop-blur-xl shadow-2xl">
          <div className="max-w-full mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl animate-pulse">🎨</div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                    CREATIVE STUDIO AI
                  </h1>
                  <p className="text-sm text-gray-300 font-medium">
                    Voice-Powered Creative Platform • Gemini Live + Imagen 4 + Veo 3
                  </p>
                </div>
              </div>

              <button
                onClick={() => setGalleryOpen(true)}
                className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 hover:scale-105"
              >
                <Images className="w-5 h-5" />
                <span>Gallery</span>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-sm">
                  {galleryItems.length}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex h-[calc(100vh-89px)]">
          {/* Voice Panel - Enhanced Side Drawer */}
          <div 
            className={`transition-all duration-300 ease-in-out ${
              voicePanelCollapsed ? 'w-16' : 'w-[420px]'
            } bg-gradient-to-b from-black/60 to-gray-900/60 backdrop-blur-xl border-r border-purple-500/30 flex flex-col shadow-2xl`}
          >
            {voicePanelCollapsed ? (
              <div className="flex-1 flex flex-col items-center py-6 space-y-6">
                <button
                  onClick={() => setVoicePanelCollapsed(false)}
                  className="p-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-all hover:scale-110 shadow-lg"
                  title="Expand Voice Panel"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
                <div className="text-2xl">🎤</div>
                <div className="text-2xl">💬</div>
                <div className="text-2xl">✨</div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="font-bold text-white text-lg">Voice Assistant</h2>
                        <p className="text-xs text-gray-300">Your creative brainstorming partner</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setVoicePanelCollapsed(true)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Collapse Panel"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-300" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <VoicePanel
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onCommand={handleVoiceCommand}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Main Canvas Area - Enhanced */}
          <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-transparent to-purple-900/10">
            {voiceContext && generationPrompt && (
              <div className="mb-6 p-5 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/50 rounded-xl shadow-2xl backdrop-blur-sm animate-in fade-in duration-500">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-600 rounded-lg flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-purple-200 mb-2 uppercase tracking-wide">
                      💬 From Your Conversation
                    </p>
                    <p className="text-base text-white font-medium leading-relaxed">
                      "{generationPrompt.length > 200 ? generationPrompt.substring(0, 200) + '...' : generationPrompt}"
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setGenerationPrompt('');
                      setVoiceContext('');
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5 text-gray-300" />
                  </button>
                </div>
              </div>
            )}
            <UnifiedComposer 
              initialPrompt={generationPrompt}
            />
          </div>
        </div>

        {/* Gallery Modal - Enhanced */}
        {galleryIsOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-gray-900 to-purple-900/50 rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-purple-500/30 shadow-2xl">
              <div className="p-6 border-b border-purple-500/30 bg-gradient-to-r from-purple-900/30 to-blue-900/30 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg">
                      <Images className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Your Gallery</h2>
                      <p className="text-sm text-gray-300">
                        {galleryItems.length} {galleryItems.length === 1 ? 'creation' : 'creations'} saved
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setGalleryOpen(false)}
                    className="p-3 hover:bg-white/10 rounded-xl text-gray-300 hover:text-white transition-all hover:scale-110"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <VeoGallery />
              </div>
            </div>
          </div>
        )}

        {/* Video Player Modal - Enhanced */}
        {videoUrl && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="max-w-6xl w-full">
              <VideoPlayer
                videoUrl={videoUrl}
                trimmedUrl={trimmedUrl}
                onClose={() => {
                  setVideoUrl(null);
                  setTrimmedUrl(null);
                }}
                onTrim={(blob, url) => {
                  setTrimmedBlob(blob);
                  setTrimmedUrl(url);
                }}
                onDownload={() => {
                  const blob = trimmedBlob || videoBlobRef.current;
                  if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `creative-studio-${Date.now()}.mp4`;
                    a.click();
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Enhanced Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-xl border-t border-purple-500/30 py-3 shadow-2xl z-40">
          <div className="max-w-full mx-auto px-6">
            <p className="text-center text-sm text-gray-200 font-medium">
              Powered by{' '}
              <span className="text-purple-400 font-bold">Gemini Live</span> •{' '}
              <span className="text-blue-400 font-bold">Imagen 4</span> •{' '}
              <span className="text-pink-400 font-bold">Veo 3</span>
              {' '}• The future of conversational content creation
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <PipecatAppBase
      transportType="daily"
      connectParams={{
        endpoint: '/api/voice/start',
      }}
    >
      {({ handleConnect, handleDisconnect }) => (
        <VideoGenerationProvider>
          <GalleryProvider>
            <VeoStudioContent 
              handleConnect={handleConnect}
              handleDisconnect={handleDisconnect}
            />
          </GalleryProvider>
        </VideoGenerationProvider>
      )}
    </PipecatAppBase>
  );
}
