'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GoogleGenAI } from '@google/genai'
import { createGeminiLiveClient, type GeminiLiveClient, type TranscriptMessage } from '@/lib/geminiLive'

interface VoiceSphereProps {
  apiKey: string;
  onGenerateVideo: (prompt: string) => void;
  onGenerateImage: (prompt: string) => void;
  onEditVideo: (prompt: string, videoId?: string) => void;
  currentVideoId?: string;
  currentImagePrompt?: string;
}

export default function VoiceSphere({ 
  apiKey, 
  onGenerateVideo, 
  onGenerateImage, 
  onEditVideo, 
  currentVideoId,
  currentImagePrompt 
}: VoiceSphereProps) {
  const [isActive, setIsActive] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationHistory, setConversationHistory] = useState<TranscriptMessage[]>([])
  const [summary, setSummary] = useState('')
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  
  const geminiClientRef = useRef<GeminiLiveClient | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)


  // Generate summary after session ends
  const generateSummary = useCallback(async (history: TranscriptMessage[]) => {
    if (history.length === 0) return
    
    try {
      setIsGeneratingSummary(true)
      const ai = new GoogleGenAI({ apiKey })
      
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
      
      // Pass the creative brief directly to the video prompt
      console.log('Generated creative brief:', summaryText)
      onGenerateVideo(summaryText)
    } catch (error) {
      console.error('Error generating summary:', error)
      setSummary('Error generating summary. Please try again.')
    } finally {
      setIsGeneratingSummary(false)
    }
  }, [currentVideoId, currentImagePrompt])


  // Initialize Gemini Live client and set up event listeners
  useEffect(() => {
    const client = createGeminiLiveClient({
      apiKey,
      systemPrompt: `You are a creative AI assistant for Veo 3 Studio. Help users create amazing videos and images through natural conversation. 
When users describe what they want to create, enhance their ideas with professional production suggestions.
Determine the appropriate action based on their request:
- Generate new video
- Generate new image  
- Edit existing content
- Just have a conversation

Be conversational, creative, and proactive.`,
    })
    
    geminiClientRef.current = client

    client.on('connected', () => {
      console.log('Gemini Live connected')
      setIsConnecting(false)
      setIsActive(true)
      setError(null)
      setConversationHistory([])
      setSummary('')
    })

    client.on('speaking-start', () => {
      setIsSpeaking(true)
    })

    client.on('speaking-end', () => {
      setIsSpeaking(false)
    })

    client.on('transcript', (event) => {
      const message = event.data as TranscriptMessage
      setConversationHistory(prev => [...prev, message])
      
      // Process assistant responses for actions
      if (message.role === 'assistant') {
        processAssistantResponse(message.text)
      }
    })

    client.on('disconnected', () => {
      console.log('Gemini Live disconnected')
      setIsActive(false)
      setIsConnecting(false)
      setConversationHistory(currentHistory => {
        generateSummary(currentHistory)
        return currentHistory
      })
    })

    client.on('error', (event) => {
      console.error('Gemini Live error:', event.error)
      setError('An error occurred. Please try again.')
      setIsActive(false)
      setIsConnecting(false)
    })

    return () => {
      if (geminiClientRef.current) {
        geminiClientRef.current.disconnect()
      }
    }
  }, [apiKey, generateSummary])

  // Process assistant response for actions
  const processAssistantResponse = useCallback((text: string) => {
    // Try to parse JSON response for actions
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        
        if (parsed.action === 'video' && parsed.prompt) {
          onGenerateVideo(parsed.prompt)
        } else if (parsed.action === 'image' && parsed.prompt) {
          onGenerateImage(parsed.prompt)
        } else if (parsed.action === 'edit' && parsed.prompt && currentVideoId) {
          onEditVideo(parsed.prompt, currentVideoId)
        }
      }
    } catch (e) {
      // Not a JSON response, just conversational
    }
  }, [onGenerateVideo, onGenerateImage, onEditVideo, currentVideoId])

  // Toggle voice interaction
  const toggleVoice = async () => {
    if (isActive) {
      geminiClientRef.current?.stopRecording()
      geminiClientRef.current?.disconnect()
    } else {
      setIsConnecting(true)
      setError(null)
      try {
        await geminiClientRef.current?.connect()
        await geminiClientRef.current?.startRecording()
      } catch (error) {
        setError('Failed to start voice interaction')
        setIsConnecting(false)
        console.error('Error starting Gemini Live:', error)
      }
    }
  }

  // Canvas animation for visualization
  useEffect(() => {
    if (!canvasRef.current || !isActive) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = 400
    canvas.height = 400
    
    let particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      alpha: number
    }> = []
    
    for (let i = 0; i < 30; i++) {
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
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/20 blur-3xl rounded-full transition-all duration-1000 ${isActive ? 'scale-110 opacity-30' : 'scale-90 opacity-10'}`} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/20 blur-3xl rounded-full transition-all duration-1000 delay-300 ${isActive ? 'scale-110 opacity-30' : 'scale-90 opacity-10'}`} />
        </div>

        {/* Advanced particle visualization */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <canvas 
            ref={canvasRef}
            className="absolute opacity-60"
            style={{ filter: 'blur(0.5px)' }}
          />
        </div>

        {/* Real-time live transcript display */}
        <div className="relative z-20 mb-6 w-full max-w-lg text-left space-y-1 min-h-[40px]">
          {latestUserTranscript && (
            <p className="text-blue-400 text-sm font-medium">You: {latestUserTranscript}</p>
          )}
          {latestAssistantResponse && (
            <p className="text-purple-400 text-sm font-medium">AI: {latestAssistantResponse}</p>
          )}
        </div>

        {/* Main sphere */}
        <button
          onClick={toggleVoice}
          disabled={isConnecting}
          className={`
            relative w-48 h-48 rounded-full flex items-center justify-center
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
              <div className="absolute inset-0 rounded-full border-2 border-blue-300/20 animate-ping animation-delay-600" />
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
              absolute inset-4 rounded-full
              bg-gradient-to-tl from-white/10 to-transparent
              transition-opacity duration-300
              ${isActive ? 'opacity-50' : 'opacity-30'}
            `} />
            
            {/* Animated gradient overlay */}
            <div 
              className={`
                absolute inset-0 rounded-full
                bg-gradient-conic from-transparent via-white/20 to-transparent
                transition-all duration-[3000ms]
                ${isActive ? 'animate-spin-slow opacity-30' : 'opacity-0'}
              `}
              style={{
                background: `conic-gradient(from ${Date.now() / 50}deg, transparent, rgba(255,255,255,0.2), transparent)`
              }}
            />

            {/* Volume-reactive overlay */}
            <div 
              className="absolute inset-0 rounded-full bg-white/10 transition-opacity duration-100"
              style={{ opacity: isSpeaking ? 0.4 : 0 }}
            />

            {/* Icon/Status indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isConnecting ? (
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isActive ? (
                <div className={`
                  w-12 h-12 rounded-full bg-white/20
                  transition-all duration-200
                  ${isSpeaking ? 'scale-110' : 'scale-100'}
                `}>
                  <svg className="w-full h-full p-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-full h-full p-3 text-white/70 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </button>

        {/* Status text */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm font-medium tracking-wide uppercase">
            {isConnecting ? 'Connecting...' : 
             isActive ? (isSpeaking ? 'Speaking' : 'Listening') : 
             'Tap to start'}
          </p>
          {error && (
            <p className="mt-2 text-red-400 text-sm">{error}</p>
          )}
        </div>

        {/* Conversation History Display */}
        {conversationHistory.length > 1 && (
          <div className="mt-8 max-w-2xl w-full px-4 space-y-2">
            <h3 className="text-white/50 text-center text-xs font-semibold uppercase pb-2">Conversation History</h3>
            {conversationHistory.slice(0, -2).map((message, index) => (
              <div key={index} className={message.role === 'user' ? 'text-right' : 'text-left'}>
                <p className={`text-xs ${message.role === 'user' ? 'text-blue-400/50' : 'text-purple-400/50'}`}>
                  {message.role === 'user' ? 'You' : 'AI'}
                </p>
                <p className="text-white/50 text-xs">{message.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Summary display */}
        {(isGeneratingSummary || summary) && (
          <div className="mt-8 max-w-4xl w-full px-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-white font-semibold text-lg mb-4">Creative Brief</h3>
              {isGeneratingSummary ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-white/70 text-sm">Generating your creative brief...</p>
                </div>
              ) : (
                <div className="text-white/90 text-sm whitespace-pre-wrap leading-relaxed">
                  {summary}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
