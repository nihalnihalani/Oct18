'use client';

import { useState, useEffect } from 'react';
import { usePipecatClient } from '@pipecat-ai/client-react';
import {
  ConnectButton,
  Conversation,
  usePipecatConnectionState,
  UserAudioControl,
} from '@pipecat-ai/voice-ui-kit';
import { Sparkles, Lightbulb, MessageSquare, Zap } from 'lucide-react';

interface VoicePanelProps {
  onConnect: () => void;
  onDisconnect: () => void;
  onCommand?: (message: string, fullContext: string) => void;
}

export default function VoicePanel({
  onConnect,
  onDisconnect,
  onCommand,
}: VoicePanelProps) {
  const { isConnected, isDisconnected } = usePipecatConnectionState();
  const client = usePipecatClient();
  const [hasDisconnected, setHasDisconnected] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);

  // Listen to conversation and build context
  useEffect(() => {
    if (!client || !isConnected) return;

    const handleUserTranscript = (event: any) => {
      if (event.text) {
        setConversationContext(prev => [...prev, `User: ${event.text}`]);
        
        // Check if user wants to generate
        const lower = event.text.toLowerCase();
        if (lower.includes('generate') || lower.includes('create that') || 
            lower.includes('make it') || lower.includes('yes') && conversationContext.length > 2) {
          // Pass the message and full context
          const fullContext = conversationContext.join('\n');
          onCommand?.(event.text, fullContext);
        }
      }
    };

    const handleAssistantTranscript = (event: any) => {
      if (event.text) {
        setConversationContext(prev => [...prev, `AI: ${event.text}`]);
      }
    };

    client.on('user-transcript', handleUserTranscript);
    client.on('bot-transcript', handleAssistantTranscript);
    
    return () => {
      client.off('user-transcript', handleUserTranscript);
      client.off('bot-transcript', handleAssistantTranscript);
    };
  }, [client, isConnected, onCommand, conversationContext]);

  const handleConnect = async () => {
    try {
      setConversationContext([]); // Reset context on new connection
      await onConnect();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleDisconnect = async () => {
    setHasDisconnected(true);
    await onDisconnect();
  };

  return (
    <div className="h-full flex flex-col p-5 space-y-5">
      {/* Enhanced Connection Header */}
      <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm border border-purple-500/40 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Creative Partner</h3>
              <div className="flex items-center space-x-2 text-xs">
                {isConnected ? (
                  <>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-green-400 font-semibold">Active • Listening</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                    <span className="text-gray-400">Ready to connect</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <ConnectButton
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        </div>

        {conversationContext.length > 0 && (
          <div className="flex items-center space-x-2 text-xs">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-purple-300 font-medium">
              {conversationContext.length} messages • Building your vision
            </span>
          </div>
        )}
      </div>

      {/* Tips / Conversation */}
      {!isConnected && !hasDisconnected ? (
        <div className="flex-1 space-y-4 overflow-auto">
          <div className="text-center py-6">
            <div className="text-7xl mb-4 animate-pulse">🧠</div>
            <h3 className="text-xl font-bold text-white mb-2">
              AI Brainstorming Partner
            </h3>
            <p className="text-sm text-gray-300 max-w-xs mx-auto leading-relaxed">
              Have a natural conversation to develop and refine your creative ideas
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/40 rounded-xl p-4 shadow-lg">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-600 rounded-lg flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-200 mb-2">💬 Brainstorm Together</p>
                  <p className="text-sm text-gray-200 mb-2 leading-relaxed">
                    "I need content for a tech product launch"
                  </p>
                  <p className="text-xs text-purple-300 italic">
                    → AI asks questions to understand your vision
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-500/40 rounded-xl p-4 shadow-lg">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-600 rounded-lg flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-200 mb-2">✨ Refine Details</p>
                  <p className="text-sm text-gray-200 mb-2 leading-relaxed">
                    "A robot in a city"
                  </p>
                  <p className="text-xs text-blue-300 italic">
                    → AI adds lighting, mood, atmosphere, style
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/40 rounded-xl p-4 shadow-lg">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-600 rounded-lg flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-200 mb-2">🎨 Generate!</p>
                  <p className="text-sm text-gray-200 mb-2 leading-relaxed">
                    "Yes, generate that!"
                  </p>
                  <p className="text-xs text-green-300 italic">
                    → Creates from your conversation context
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : hasDisconnected ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <div className="text-6xl mb-4">👋</div>
            <h3 className="text-2xl font-bold text-white">Great session!</h3>
            <p className="text-base text-gray-300">
              Your ideas are saved in the gallery
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-500/50"
            >
              Start New Session
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Enhanced Conversation */}
          <div className="flex-1 bg-gradient-to-br from-black/50 to-gray-900/50 rounded-xl overflow-hidden border border-purple-500/30 shadow-2xl">
            <div className="h-full flex flex-col">
              <div className="px-4 py-3 bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-b border-purple-500/30 backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-purple-300" />
                  <span className="text-sm font-semibold text-white">Creative Session</span>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <Conversation
                  assistantLabel="🎨 AI Creative"
                  clientLabel="You"
                  textMode="tts"
                />
              </div>
            </div>
          </div>

          {/* Enhanced Audio Controls */}
          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/40 rounded-xl p-4 shadow-lg backdrop-blur-sm">
            <div className="mb-3 text-center">
              <p className="text-sm font-bold text-white mb-1">🎤 Your Microphone</p>
              <p className="text-xs text-gray-400">Speak clearly - I'm listening!</p>
            </div>
            <UserAudioControl visualizerProps={{ barCount: 9 }} />
            <div className="mt-3 text-center">
              <p className="text-xs text-green-400 font-medium">
                ✓ Microphone active - Just start talking
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
