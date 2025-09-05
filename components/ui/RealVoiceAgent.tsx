'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GoogleGenAI } from '@google/genai'
import Vapi from "@vapi-ai/web"

interface RealVoiceAgentProps {
  onGenerateVideo: (prompt: string) => void
  onGenerateImage: (prompt: string) => void
  onEditVideo: (prompt: string, videoId?: string) => void
  currentVideoId?: string
  currentImagePrompt?: string
}

export default function RealVoiceAgent({ 
  onGenerateVideo, 
  onGenerateImage, 
  onEditVideo, 
  currentVideoId,
  currentImagePrompt 
}: RealVoiceAgentProps) {
  const [isActive, setIsActive] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', text: string}>>([])
  const [summary, setSummary] = useState('')
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isProcessingCommand, setIsProcessingCommand] = useState(false)
  
  const vapiRef = useRef<Vapi | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const aiRef = useRef<GoogleGenAI | null>(null)

  // Initialize AI
  useEffect(() => {
    if (typeof window !== 'undefined') {
      aiRef.current = new GoogleGenAI({ apiKey: "AIzaSyCGIqOfyKS6Ha0i4PgTsBZ8kXeomBJvRtQ" })
    }
  }, [])

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

Current context: User is ${currentVideoId ? 'viewing a video' : 'on main page'}
${currentImagePrompt ? `Current image prompt: ${currentImagePrompt}` : ''}

Available actions:
- "video": Generate a new video using Veo 3
- "image": Generate a new image using Imagen
- "edit": Edit existing video content
- "none": Just conversational response

Examples:
- User: "Create a video of a sunset" → {"text": "I'll create a beautiful sunset video for you!", "action": "video", "prompt": "Cinematic sunset over ocean waves, golden hour lighting, peaceful and serene atmosphere"}
- User: "Generate an image of a cat" → {"text": "I'll create a cute cat image for you!", "action": "image", "prompt": "A beautiful, detailed image of a cute cat sitting in a garden"}
- User: "Make it more dramatic" → {"text": "I'll make the video more dramatic!", "action": "edit", "prompt": "Make the video more dramatic with intense lighting and dynamic camera movements"}

Respond ONLY with the JSON object, no additional text.
`;

    try {
      const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([
        { text: context },
        { text: userInput }
      ]);

      const response = await result.response;
      const responseText = response.text().trim();

      // Parse JSON response
      try {
        const command = JSON.parse(responseText);
        return command;
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback: try to determine action from keywords
        const lowerInput = userInput.toLowerCase();
        if (lowerInput.includes('video') || lowerInput.includes('create') || lowerInput.includes('make')) {
          return {
            text: "I'll create a video for you!",
            action: "video",
            prompt: userInput
          };
        } else if (lowerInput.includes('image') || lowerInput.includes('picture') || lowerInput.includes('photo')) {
          return {
            text: "I'll create an image for you!",
            action: "image",
            prompt: userInput
          };
        } else if (lowerInput.includes('edit') || lowerInput.includes('change') || lowerInput.includes('modify')) {
          return {
            text: "I'll help you edit the content!",
            action: "edit",
            prompt: userInput
          };
        } else {
          return {
            text: "I understand. How can I help you create content?",
            action: "none",
            prompt: ""
          };
        }
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      return {
        text: "I'm sorry, I couldn't process that. Please try again.",
        action: "none",
        prompt: ""
      };
    }
  }, [currentVideoId, currentImagePrompt]);

  // Generate summary after session ends
  const generateSummary = useCallback(async (history: Array<{role: 'user' | 'assistant', text: string}>) => {
    if (history.length === 0) return
    
    try {
      setIsGeneratingSummary(true)
      const ai = new GoogleGenAI({ apiKey: "AIzaSyCGIqOfyKS6Ha0i4PgTsBZ8kXeomBJvRtQ" })
      
      const conversationText = history.map(entry => 
        `${entry.role === 'user' ? 'User' : 'AI'}: ${entry.text}`
      ).join('\n\n')
      
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
          role: 'user',
          parts: [{
            text: `Based on this conversation about content creation for Veo 3 Studio, create a comprehensive creative brief that includes:

1. Product Details & Unique Selling Points
2. Brand Style & Visual Direction
3. Target Platform & Audience
4. Recommended Shot Types & Concepts
5. Technical Specifications (aspect ratios, formats)

Conversation:
${conversationText}

Please format this as a professional creative brief that can be used to generate videos or images. Also, if the user mentioned wanting to create specific content, extract the key creative elements and suggest a detailed prompt for video or image generation.

Current context: ${currentVideoId ? 'User is viewing a video' : 'User is on main page'}
${currentImagePrompt ? `Current image prompt: ${currentImagePrompt}` : ''}`
          }]
        }]
      })
      
      const summaryText = result.text || 'No summary generated'
      setSummary(summaryText)
      
      // Process the summary to extract actionable commands
      await processSummaryForCommands(summaryText, conversationText)
      
      console.log('Generated summary:', summaryText)
    } catch (error) {
      console.error('Error generating summary:', error)
      setSummary('Error generating summary. Please try again.')
    } finally {
      setIsGeneratingSummary(false)
    }
  }, [currentVideoId, currentImagePrompt])

  // Process summary to extract and execute commands
  const processSummaryForCommands = useCallback(async (summaryText: string, conversationText: string) => {
    try {
      setIsProcessingCommand(true)
      
      const ai = new GoogleGenAI({ apiKey: "AIzaSyCGIqOfyKS6Ha0i4PgTsBZ8kXeomBJvRtQ" })
      
      const result = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{
          role: 'user',
          parts: [{
            text: `Analyze this conversation and creative brief to determine what content should be generated:

Conversation: ${conversationText}
Creative Brief: ${summaryText}

Based on the conversation, determine:
1. Should we generate a VIDEO or IMAGE?
2. What is the specific prompt for generation?
3. Is this editing existing content or creating new content?

Respond in JSON format:
{
  "action": "video" | "image" | "edit" | "none",
  "prompt": "detailed prompt for generation",
  "reasoning": "why this action was chosen"
}

If the user wants to create content, use the creative brief to generate a detailed, professional prompt.`
          }]
        }]
      })
      
      const response = await result.response
      const responseText = response.text().trim()
      
      try {
        const command = JSON.parse(responseText)
        console.log('Extracted command:', command)
        
        if (command.action === 'video') {
          onGenerateVideo(command.prompt)
        } else if (command.action === 'image') {
          onGenerateImage(command.prompt)
        } else if (command.action === 'edit' && currentVideoId) {
          onEditVideo(command.prompt, currentVideoId)
        }
      } catch (parseError) {
        console.error('Error parsing command:', parseError)
        // Fallback: try to extract video generation from conversation
        if (conversationText.toLowerCase().includes('video') || conversationText.toLowerCase().includes('create')) {
          onGenerateVideo(summaryText)
        }
      }
    } catch (error) {
      console.error('Error processing commands:', error)
    } finally {
      setIsProcessingCommand(false)
    }
  }, [onGenerateVideo, onGenerateImage, onEditVideo, currentVideoId])

  // Initialize Vapi and set up event listeners
  useEffect(() => {
    // For demo purposes, we'll use a mock implementation
    // In production, you would use actual Vapi keys
    const mockVapiInstance = {
      start: () => {
        console.log('Mock Vapi started')
        setIsConnecting(false)
        setIsActive(true)
        setError(null)
        setConversationHistory([])
        setSummary('')
        
        // Simulate conversation after 2 seconds
        setTimeout(() => {
          setConversationHistory([
            { role: 'user', text: 'I want to create a video of a sunset over mountains for my travel blog' },
            { role: 'assistant', text: 'I\'ll help you create a beautiful sunset mountain video for your travel blog. Let me generate that for you.' }
          ])
        }, 2000)
        
        // Auto-end after 5 seconds for demo
        setTimeout(() => {
          setIsActive(false)
          setIsConnecting(false)
          generateSummary([
            { role: 'user', text: 'I want to create a video of a sunset over mountains for my travel blog' },
            { role: 'assistant', text: 'I\'ll help you create a beautiful sunset mountain video for your travel blog. Let me generate that for you.' }
          ])
        }, 5000)
      },
      stop: () => {
        console.log('Mock Vapi stopped')
        setIsActive(false)
        setIsConnecting(false)
      },
      on: () => {} // Mock event listener
    }
    
    vapiRef.current = mockVapiInstance as any

    return () => {
      mockVapiInstance.stop()
    }
  }, [generateSummary])

  // Toggle voice interaction
  const toggleVoice = () => {
    if (isActive) {
      vapiRef.current?.stop()
    } else {
      setIsConnecting(true)
      vapiRef.current?.start()
    }
  }

  // Canvas animation for visualization
  useEffect(() => {
    if (!canvasRef.current || !isActive) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = 300
    canvas.height = 300
    
    let particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      alpha: number
    }> = []
    
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.4 + 0.4
      })
    }
    
    let animationFrameId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      const volume = isSpeaking ? 0.7 : 0.2;

      particles.forEach(particle => {
        particle.x += particle.vx * (1 + volume * 1.5)
        particle.y += particle.vy * (1 + volume * 1.5)
        
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius * (1 + volume), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(59, 130, 246, ${particle.alpha * (0.5 + volume * 0.5)})`
        ctx.fill()
      })
      
      animationFrameId = requestAnimationFrame(animate)
    }
    
    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isActive, isSpeaking])

  const latestUserTranscript = conversationHistory.filter(m => m.role === 'user').pop()?.text || ''
  const latestAssistantResponse = conversationHistory.filter(m => m.role === 'assistant').pop()?.text || ''

  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-black/90 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-white font-semibold text-lg">Voice Agent</h2>
        <p className="text-white/60 text-sm">AI-powered content creation</p>
      </div>

      {/* Voice Sphere Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/20 blur-3xl rounded-full transition-all duration-1000 ${isActive ? 'scale-110 opacity-30' : 'scale-90 opacity-10'}`} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/20 blur-3xl rounded-full transition-all duration-1000 delay-300 ${isActive ? 'scale-110 opacity-30' : 'scale-90 opacity-10'}`} />
        </div>

        {/* Particle visualization */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <canvas 
            ref={canvasRef}
            className="absolute opacity-60"
            style={{ filter: 'blur(0.5px)' }}
          />
        </div>

        {/* Live transcript */}
        <div className="relative z-20 mb-4 w-full text-left space-y-1 min-h-[40px]">
          {latestUserTranscript && (
            <p className="text-blue-400 text-xs font-medium">You: {latestUserTranscript}</p>
          )}
          {latestAssistantResponse && (
            <p className="text-purple-400 text-xs font-medium">AI: {latestAssistantResponse}</p>
          )}
        </div>

        {/* Main sphere */}
        <button
          onClick={toggleVoice}
          disabled={isConnecting}
          className={`
            relative w-32 h-32 rounded-full flex items-center justify-center
            transition-all duration-500 transform
            ${isActive ? 'scale-110' : 'scale-100 hover:scale-105'}
            ${isConnecting ? 'cursor-wait' : 'cursor-pointer'}
            group
          `}
        >
          {/* Outer glow layers */}
          <div className={`
            absolute inset-0 rounded-full
            bg-gradient-to-r from-blue-500 to-purple-500
            transition-all duration-500
            ${isActive ? 'opacity-20 scale-125' : 'opacity-0 scale-110'}
            blur-xl
          `} />
          
          <div className={`
            absolute inset-0 rounded-full
            bg-gradient-to-r from-blue-400 to-purple-400
            transition-all duration-500
            ${isActive ? 'opacity-30 scale-110' : 'opacity-0 scale-105'}
            blur-md
          `} />

          {/* Dynamic rings */}
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 animate-ping" />
              <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-ping animation-delay-300" />
            </>
          )}

          {/* Main sphere gradient */}
          <div className={`
            relative w-full h-full rounded-full overflow-hidden
            bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500
            transition-all duration-300
            ${isActive ? 'shadow-2xl shadow-blue-500/50' : 'shadow-lg shadow-black/50'}
          `}>
            {/* Inner light effect */}
            <div className={`
              absolute inset-2 rounded-full
              bg-gradient-to-tl from-white/10 to-transparent
              transition-opacity duration-300
              ${isActive ? 'opacity-50' : 'opacity-30'}
            `} />

            {/* Icon/Status indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isConnecting ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isActive ? (
                <div className={`
                  w-8 h-8 rounded-full bg-white/20
                  transition-all duration-200
                  ${isSpeaking ? 'scale-110' : 'scale-100'}
                `}>
                  <svg className="w-full h-full p-2 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-full h-full p-2 text-white/70 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </button>

        {/* Status text */}
        <div className="mt-4 text-center">
          <p className="text-white/70 text-xs font-medium tracking-wide uppercase">
            {isConnecting ? 'Connecting...' : 
             isActive ? (isSpeaking ? 'Speaking' : 'Listening') : 
             'Tap to start'}
          </p>
          {error && (
            <p className="mt-2 text-red-400 text-xs">{error}</p>
          )}
          <p className="mt-2 text-blue-400 text-xs">Demo Mode: Simulated conversation</p>
        </div>
      </div>

      {/* Summary and Commands */}
      <div className="p-4 border-t border-white/10 max-h-64 overflow-y-auto">
        {(isGeneratingSummary || summary) && (
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm">Creative Brief</h3>
            {isGeneratingSummary ? (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white/70 text-xs">Generating creative brief...</p>
              </div>
            ) : (
              <div className="text-white/90 text-xs whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
                {summary}
              </div>
            )}
          </div>
        )}

        {isProcessingCommand && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/70 text-xs">Processing command...</p>
          </div>
        )}
      </div>
    </div>
  )
}
