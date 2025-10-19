"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { createGeminiLiveClient, type GeminiLiveClient, type TranscriptMessage } from '@/lib/geminiLive';
import { Mic, MicOff, Square, Loader2, Sparkles, X, Minimize2 } from 'lucide-react';

interface VoiceSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onGenerateVideo: (prompt: string) => void;
  onGenerateImage: (prompt: string) => void;
  onEditVideo: (prompt: string, videoId?: string) => void;
  currentVideoId?: string;
  currentImagePrompt?: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  action?: 'video' | 'image' | 'edit' | 'none';
}

export default function VoiceSidebar({
  isOpen,
  onToggle,
  onGenerateVideo,
  onGenerateImage,
  onEditVideo,
  currentVideoId,
  currentImagePrompt
}: VoiceSidebarProps) {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [summary, setSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const geminiClientRef = useRef<GeminiLiveClient | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  // Initialize AI
  useEffect(() => {
    if (typeof window !== 'undefined') {
      aiRef.current = new GoogleGenAI({ apiKey: "AIzaSyCGIqOfyKS6Ha0i4PgTsBZ8kXeomBJvRtQ" });
    }
  }, []);

  // Generate summary after session ends
  const generateSummary = useCallback(async (history: ConversationMessage[]) => {
    if (history.length === 0) return;
    
    try {
      setIsGeneratingSummary(true);
      
      const ai = new GoogleGenAI({ apiKey: "AIzaSyCGIqOfyKS6Ha0i4PgTsBZ8kXeomBJvRtQ" });
      
      const conversationText = history.map(entry => 
        `${entry.role === 'user' ? 'User' : 'AI'}: ${entry.text}`
      ).join('\n\n');
      
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [{
            text: `Based on this conversation about content creation for Veo 3 Studio, create a comprehensive creative brief that includes:

1. Content Type & Purpose
2. Visual Style & Direction
3. Target Audience & Platform
4. Recommended Approaches & Techniques
5. Technical Specifications

Conversation:
${conversationText}

Please format this as a professional creative brief for content creation.`
          }]
        }]
      });
      
      const summaryText = result.text || 'No summary generated';
      setSummary(summaryText);
      console.log('Generated summary:', summaryText);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Error generating summary. Please try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  }, []);

  // Process voice input and determine action
  const processVoiceCommand = useCallback(async (userInput: string): Promise<{
    text: string;
    action: 'video' | 'image' | 'edit' | 'none';
    prompt: string;
  }> => {
    const ai = new GoogleGenAI({ apiKey: "AIzaSyCGIqOfyKS6Ha0i4PgTsBZ8kXeomBJvRtQ" });

    const context = `
You are a creative AI assistant for Veo 3 Studio, an AI video and image generation platform. 
Your role is to help users create content through voice commands.

Available actions:
- "video": Generate a new video
- "image": Generate a new image  
- "edit": Edit existing video (only if user is currently viewing a video)
- "none": Just respond conversationally

Current context:
- User is ${currentVideoId ? 'viewing a video' : 'on the main page'}
- ${currentImagePrompt ? `Current image prompt: ${currentImagePrompt}` : 'No current image context'}

User input: "${userInput}"

Respond with a JSON object containing:
{
  "text": "Your conversational response to the user",
  "action": "video|image|edit|none",
  "prompt": "The specific prompt for content generation (if action is video/image/edit)"
}

Examples:
- User: "Create a video of a sunset over mountains" → {"text": "I'll create a beautiful sunset video for you!", "action": "video", "prompt": "A cinematic sunset over majestic mountains with warm golden light"}
- User: "Make it more dramatic" → {"text": "I'll make the video more dramatic!", "action": "edit", "prompt": "Make the video more dramatic with intense lighting and dynamic camera movements"}
- User: "Generate an image of a cat" → {"text": "I'll create a cute cat image for you!", "action": "image", "prompt": "A beautiful, detailed image of a cute cat sitting in a garden"}

Respond ONLY with the JSON object, no additional text.
`;

    try {
      const result = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{
          role: 'user',
          parts: [
            { text: context },
            { text: userInput }
          ]
        }]
      });

      const responseText = (result.text || '').trim();

      // Parse JSON response
      const parsedResponse = JSON.parse(responseText);
      return {
        text: parsedResponse.text,
        action: parsedResponse.action,
        prompt: parsedResponse.prompt || userInput
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        text: "I understand you want to create content. Could you be more specific about what you'd like to generate?",
        action: 'none',
        prompt: userInput
      };
    }
  }, [currentVideoId, currentImagePrompt]);

  // Initialize Gemini Live client
  useEffect(() => {
    if (!isOpen) return;

    const client = createGeminiLiveClient({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
      systemPrompt: `You are a creative AI assistant for Veo 3 Studio. Help users create content through voice commands.
Analyze their requests and provide helpful, conversational responses.`,
    });

    geminiClientRef.current = client;

    client.on('connected', () => {
      console.log('Gemini Live connected');
      setIsConnecting(false);
      setIsActive(true);
      setError(null);
      setConversationHistory([]);
      setSummary('');
    });

    client.on('transcript', (event) => {
      const message = event.data as TranscriptMessage;
      const convMessage: ConversationMessage = {
        role: message.role,
        text: message.text,
        timestamp: message.timestamp,
        action: 'none',
      };
      setConversationHistory(prev => [...prev, convMessage]);
      
      // Process for actions
      if (message.role === 'assistant') {
        processVoiceCommand(message.text);
      }
    });

    client.on('disconnected', () => {
      console.log('Gemini Live disconnected');
      setIsActive(false);
      setIsConnecting(false);
    });

    client.on('error', (event) => {
      console.error('Gemini Live error:', event.error);
      setError('An error occurred. Please try again.');
      setIsActive(false);
      setIsConnecting(false);
    });

    return () => {
      if (geminiClientRef.current) {
        geminiClientRef.current.disconnect();
      }
    };
  }, [isOpen]);

  // Canvas animation for visualization
  useEffect(() => {
    if (!canvasRef.current || !isOpen) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = 200;
    canvas.height = 200;
    
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }> = [];
    
    for (let i = 0; i < 15; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.4 + 0.4
      });
    }
    
    let animationFrameId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const volume = isSpeaking || isActive ? 0.7 : 0.2;

      particles.forEach(particle => {
        particle.x += particle.vx * (1 + volume * 1.5);
        particle.y += particle.vy * (1 + volume * 1.5);
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * (1 + volume), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 51, 234, ${particle.alpha * (0.5 + volume * 0.5)})`;
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen, isSpeaking, isActive]);

  // Toggle voice interaction
  const toggleVoice = async () => {
    if (isActive) {
      geminiClientRef.current?.stopRecording();
      geminiClientRef.current?.disconnect();
    } else {
      setIsConnecting(true);
      setError(null);
      try {
        await geminiClientRef.current?.connect();
        await geminiClientRef.current?.startRecording();
      } catch (error) {
        setError('Failed to start voice interaction');
        setIsConnecting(false);
        console.error('Error starting Gemini Live:', error);
      }
    }
  };

  // Mock voice input processing (in production, this would come from Vapi)
  const handleMockVoiceInput = async (input: string) => {
    const userMessage: ConversationMessage = {
      role: 'user',
      text: input,
      timestamp: new Date(),
      action: 'none'
    };
    setConversationHistory(prev => [...prev, userMessage]);

    try {
      const aiResponse = await processVoiceCommand(input);
      
      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        text: aiResponse.text,
        timestamp: new Date(),
        action: aiResponse.action
      };
      setConversationHistory(prev => [...prev, assistantMessage]);

      // Execute the determined action
      if (aiResponse.action === 'video') {
        onGenerateVideo(aiResponse.prompt);
      } else if (aiResponse.action === 'image') {
        onGenerateImage(aiResponse.prompt);
      } else if (aiResponse.action === 'edit' && currentVideoId) {
        onEditVideo(aiResponse.prompt, currentVideoId);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      setError(`Failed to process voice command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed left-0 top-0 h-full bg-gray-900/95 backdrop-blur-xl border-r border-gray-700 z-40 transition-all duration-300 ${
      isMinimized ? 'w-16' : 'w-80'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isMinimized && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-white font-semibold">Voice Agent</h2>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-col h-full">
          {/* Voice Sphere */}
          <div className="flex flex-col items-center p-6">
            <div className="relative mb-4">
              {/* Particle Visualization */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <canvas 
                  ref={canvasRef}
                  className="absolute opacity-60"
                  style={{ filter: 'blur(0.5px)' }}
                />
              </div>

              {/* Main Voice Button */}
              <button
                onClick={toggleVoice}
                disabled={isConnecting}
                className={`
                  relative w-24 h-24 rounded-full flex items-center justify-center
                  transition-all duration-500 transform
                  ${isActive ? 'scale-110' : 'scale-100 hover:scale-105'}
                  ${isConnecting ? 'cursor-wait' : 'cursor-pointer'}
                  group
                `}
              >
                {/* Outer glow */}
                <div className={`
                  absolute inset-0 rounded-full
                  bg-gradient-to-r from-purple-500 to-pink-500
                  transition-all duration-500
                  ${isActive ? 'opacity-20 scale-125' : 'opacity-0 scale-110'}
                  blur-xl
                `} />
                
                {/* Main sphere */}
                <div className={`
                  relative w-full h-full rounded-full overflow-hidden
                  bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600
                  transition-all duration-300
                  ${isActive ? 'shadow-2xl shadow-purple-500/50' : 'shadow-lg shadow-black/50'}
                `}>
                  {/* Inner light effect */}
                  <div className={`
                    absolute inset-2 rounded-full
                    bg-gradient-to-tl from-white/10 to-transparent
                    transition-opacity duration-300
                    ${isActive ? 'opacity-50' : 'opacity-30'}
                  `} />
                  
                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isConnecting ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : isActive ? (
                      <Square className="w-6 h-6 text-white" />
                    ) : (
                      <Mic className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
                    )}
                  </div>
                </div>
              </button>
            </div>

            {/* Status Display */}
            <div className="text-center space-y-2">
              <p className="text-white/70 text-xs font-medium tracking-wide uppercase">
                {isConnecting ? 'Connecting...' : 
                 isActive ? (isSpeaking ? 'Speaking' : 'Listening') : 
                 'Tap to start'}
              </p>
              
              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}
            </div>

            {/* Quick Commands */}
            <div className="mt-4 grid grid-cols-1 gap-2 text-xs w-full">
              <button
                onClick={() => handleMockVoiceInput("Create a video of a sunset over mountains")}
                className="bg-gray-700/50 rounded-lg p-2 text-left hover:bg-gray-600/50 transition-colors"
              >
                <p className="text-gray-300 font-medium">Create Video</p>
                <p className="text-gray-400">"Make a video of..."</p>
              </button>
              <button
                onClick={() => handleMockVoiceInput("Generate an image of a cute cat")}
                className="bg-gray-700/50 rounded-lg p-2 text-left hover:bg-gray-600/50 transition-colors"
              >
                <p className="text-gray-300 font-medium">Generate Image</p>
                <p className="text-gray-400">"Create an image of..."</p>
              </button>
              <button
                onClick={() => handleMockVoiceInput("Make it more dramatic")}
                className="bg-gray-700/50 rounded-lg p-2 text-left hover:bg-gray-600/50 transition-colors"
              >
                <p className="text-gray-300 font-medium">Edit Content</p>
                <p className="text-gray-400">"Make it more..."</p>
              </button>
            </div>
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="text-white font-semibold text-sm px-4 py-2 border-b border-gray-700">Conversation</h3>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {conversationHistory.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-4">
                  Start a conversation by clicking the voice button or using quick commands.
                </p>
              ) : (
                conversationHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-2 text-xs ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-200'
                    }`}>
                      <p>{message.text}</p>
                      {message.action !== 'none' && (
                        <p className="opacity-70 mt-1 text-xs">
                          Action: {message.action}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Summary */}
          {(isGeneratingSummary || summary) && (
            <div className="border-t border-gray-700 p-4">
              <h3 className="text-white font-semibold text-sm mb-2">Creative Brief</h3>
              {isGeneratingSummary ? (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white/70 text-xs">Generating...</p>
                </div>
              ) : (
                <div className="text-white/90 text-xs whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                  {summary}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <button
            onClick={toggleVoice}
            disabled={isConnecting}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isActive ? 'bg-purple-600 scale-110' : 'bg-gray-700 hover:bg-gray-600'}
              ${isConnecting ? 'cursor-wait' : 'cursor-pointer'}
            `}
          >
            {isConnecting ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : isActive ? (
              <Square className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>
          
          {isActive && (
            <div className="text-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mx-auto mb-1"></div>
              <p className="text-white/70 text-xs">Active</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
