import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { audio, mimeType } = await req.json();

    if (!audio) {
      return NextResponse.json(
        { error: "No audio data provided" },
        { status: 400 }
      );
    }

    // Use Gemini to transcribe and respond to audio in real-time
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{
        role: 'user',
        parts: [
          {
            text: `System: You are a creative AI assistant for Veo 3 Studio, an AI video and image generation platform. 
Your role is to help users create content through voice commands. Be conversational, helpful, and proactive in suggesting creative ideas.
When users describe what they want to create, enhance their ideas with professional production suggestions.

Please transcribe this audio and provide a helpful, conversational response. If the user is describing content they want to create, enhance their idea with creative suggestions.`
          },
          {
            inlineData: {
              data: audio,
              mimeType: mimeType || "audio/webm",
            },
          },
        ],
      }],
    });

    const text = result.text || '';

    // Extract transcript (this is simplified - in production you'd have better parsing)
    const transcript = text.split('\n')[0] || text;
    const aiResponse = text.split('\n').slice(1).join('\n') || text;

    console.log('Gemini Live stream response:', {
      transcript: transcript.substring(0, 100) + '...',
      responseLength: aiResponse.length,
    });

    return NextResponse.json({
      transcript,
      response: {
        text: aiResponse,
        // In a real implementation with Gemini 2.0 native audio, you'd get audio back
        audio: null,
      },
      success: true,
    });
  } catch (error) {
    console.error('Error processing audio stream:', error);
    return NextResponse.json(
      {
        error: 'Failed to process audio',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

