'use client';

import { useState, useCallback } from 'react';
import { PipecatAppBase } from '@pipecat-ai/voice-ui-kit';
import VoiceCommands from '../components/voice/VoiceCommands';
import UnifiedComposer from '../components/ui/UnifiedComposer';
import VeoGallery from '../components/ui/VeoGallery';
import ModelSelector from '../components/ui/ModelSelector';
import { VideoGenerationProvider } from '../contexts/VideoGenerationContext';
import { GalleryProvider } from '../contexts/GalleryContext';
import '@pipecat-ai/voice-ui-kit/styles.scoped';

export default function VoiceStudioPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'gallery'>('generate');
  const [prompt, setPrompt] = useState('');

  // Handle voice commands
  const handleVoiceCommand = useCallback((command: string) => {
    console.log('Voice command:', command);
    
    // Parse commands for generation
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('create') || lowerCommand.includes('generate') || lowerCommand.includes('make')) {
      if (lowerCommand.includes('image')) {
        // Extract prompt and trigger image generation
        const imagePrompt = extractPrompt(command);
        setPrompt(imagePrompt);
        setActiveTab('generate');
      } else if (lowerCommand.includes('video')) {
        // Extract prompt and trigger video generation
        const videoPrompt = extractPrompt(command);
        setPrompt(videoPrompt);
        setActiveTab('generate');
      }
    } else if (lowerCommand.includes('show') || lowerCommand.includes('gallery')) {
      setActiveTab('gallery');
    }
  }, []);

  // Extract prompt from natural language command
  const extractPrompt = (command: string): string => {
    // Remove command words
    let prompt = command
      .replace(/create|generate|make|an?|image|video|of|for|me/gi, '')
      .trim();
    
    return prompt || command;
  };

  return (
    <div className="vkui-root voice-ui-kit">
      <PipecatAppBase
        transportType="daily"
        connectParams={{
          endpoint: '/api/voice/start',
        }}
      >
        {({ handleConnect, handleDisconnect }) => (
          <VideoGenerationProvider>
            <GalleryProvider>
              <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
                {/* Header */}
                <header className="border-b border-gray-700 bg-black/30 backdrop-blur-sm">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                      {/* Logo */}
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">🎨</div>
                        <div>
                          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            VEO-3 STUDIO PRO
                          </h1>
                          <p className="text-sm text-gray-400">
                            Voice-Controlled Creative Studio
                          </p>
                        </div>
                      </div>

                      {/* Model Selector */}
                      <ModelSelector />

                      {/* Navigation */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setActiveTab('generate')}
                          className={`px-6 py-2 rounded-lg transition-all ${
                            activeTab === 'generate'
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          🎨 Generate
                        </button>
                        <button
                          onClick={() => setActiveTab('gallery')}
                          className={`px-6 py-2 rounded-lg transition-all ${
                            activeTab === 'gallery'
                              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          📚 Gallery
                        </button>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  {activeTab === 'generate' ? (
                    <UnifiedComposer initialPrompt={prompt} />
                  ) : (
                    <VeoGallery />
                  )}
                </main>

                {/* Voice Commands Component */}
                <VoiceCommands
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onCommand={handleVoiceCommand}
                />

                {/* Footer */}
                <footer className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm border-t border-gray-700 py-2 text-center">
                  <p className="text-sm text-gray-400">
                    Powered by{' '}
                    <span className="text-purple-400 font-semibold">Gemini Live</span> +{' '}
                    <span className="text-blue-400 font-semibold">Imagen 4</span> +{' '}
                    <span className="text-pink-400 font-semibold">Veo 3</span>
                  </p>
                </footer>
              </div>
            </GalleryProvider>
          </VideoGenerationProvider>
        )}
      </PipecatAppBase>
    </div>
  );
}

