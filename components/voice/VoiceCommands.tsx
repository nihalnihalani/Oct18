'use client';

import { useState, useEffect } from 'react';
import {
  ConnectButton,
  Conversation,
  Card,
  CardContent,
  usePipecatConnectionState,
  UserAudioControl,
  usePipecatClient,
} from '@pipecat-ai/voice-ui-kit';
import { Mic, MicOff } from 'lucide-react';

interface VoiceCommandsProps {
  onConnect: () => void;
  onDisconnect: () => void;
  onCommand?: (command: string) => void;
}

export default function VoiceCommands({
  onConnect,
  onDisconnect,
  onCommand,
}: VoiceCommandsProps) {
  const { isConnected } = usePipecatConnectionState();
  const client = usePipecatClient();
  const [isExpanded, setIsExpanded] = useState(false);

  // Listen for voice commands
  useEffect(() => {
    if (!client || !isConnected) return;

    const handleMessage = (message: any) => {
      if (message.role === 'user' && onCommand) {
        onCommand(message.content);
      }
    };

    // Subscribe to messages
    client.on('message', handleMessage);
    
    return () => {
      client.off('message', handleMessage);
    };
  }, [client, isConnected, onCommand]);

  const handleConnect = async () => {
    try {
      await onConnect();
    } catch (error) {
      console.error('Voice connection error:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        /* Collapsed: Floating button */
        <button
          onClick={() => setIsExpanded(true)}
          className={`group relative p-4 rounded-full shadow-lg transition-all ${
            isConnected
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-green-500/50'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-purple-500/50'
          } hover:scale-110`}
          title={isConnected ? 'Voice connected - Click to expand' : 'Connect voice assistant'}
        >
          {isConnected ? (
            <Mic className="w-6 h-6 text-white animate-pulse" />
          ) : (
            <MicOff className="w-6 h-6 text-white" />
          )}
          
          {/* Status indicator */}
          {isConnected && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          )}

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {isConnected ? '🟢 Voice AI Active' : '🎤 Click to connect voice'}
          </div>
        </button>
      ) : (
        /* Expanded: Voice panel */
        <Card className="w-96 max-h-[600px] shadow-2xl">
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">Voice Assistant</h3>
                  <p className="text-xs opacity-90">
                    {isConnected ? 'Listening...' : 'Not connected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ConnectButton
                  onConnect={handleConnect}
                  onDisconnect={onDisconnect}
                />
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Conversation */}
            {isConnected ? (
              <div className="h-96">
                <Conversation
                  assistantLabel="AI Studio"
                  clientLabel="You"
                  textMode="tts"
                />
              </div>
            ) : (
              <div className="p-6 text-center space-y-4">
                <div className="text-4xl">🎤</div>
                <h4 className="font-semibold">Voice Control</h4>
                <p className="text-sm text-gray-600">
                  Connect to create images and videos using just your voice!
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Try saying:</p>
                  <p className="font-mono bg-gray-100 p-2 rounded">
                    "Create an image of a sunset over mountains"
                  </p>
                  <p className="font-mono bg-gray-100 p-2 rounded">
                    "Turn this into a video"
                  </p>
                </div>
              </div>
            )}

            {/* Audio Control */}
            {isConnected && (
              <div className="p-3 border-t">
                <UserAudioControl visualizerProps={{ barCount: 5 }} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

