'use client'

import dynamic from 'next/dynamic'

// Dynamically import the voice sphere to avoid SSR issues with audio APIs
const VoiceSphere = dynamic(() => import('@/components/voice-sphere'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
})

export default function Home() {
  // In production, you should use environment variables for the API key
  // For now, you'll need to pass it as a prop or configure it properly
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
  const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || ''
  const VAPI_ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || ''

  return (
    <main className="min-h-screen bg-black">
      <VoiceSphere apiKey={GEMINI_API_KEY} vapiPubKey={VAPI_PUBLIC_KEY} vapiAssistantId={VAPI_ASSISTANT_ID} />
      
      {/* Optional: Add app title/branding */}
      <div className="absolute top-8 left-8 text-white">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Pitch Perfect
        </h1>
        <p className="text-sm text-white/50 mt-1">AI Voice Assistant</p>
      </div>
      
      {/* Optional: Add instructions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="text-white/40 text-sm max-w-md px-4">
          Click the sphere to start a conversation. 
          Your voice will be processed by Google's Gemini Live AI.
        </p>
      </div>
    </main>
  )
}
