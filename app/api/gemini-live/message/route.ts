import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { text, history } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    // Build conversation history
    const contents = [];
    
    // Add system instruction as first message
    contents.push({
      role: 'user',
      parts: [{ text: `System: You are a creative AI assistant for Veo 3 Studio. Help users create amazing videos and images.
Analyze their requests and determine the appropriate action:
- "video": Generate a new video
- "image": Generate a new image
- "edit": Edit existing content
- "none": Just respond conversationally

Respond in JSON format:
{
  "text": "Your conversational response",
  "action": "video|image|edit|none",
  "prompt": "Optimized prompt for content generation",
  "suggestions": ["suggestion1", "suggestion2"]
}` }],
    });
    
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-5)) { // Last 5 messages for context
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.text }],
        });
      }
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text }],
    });

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
    });

    const responseText = result.text || '';
    
    // Try to parse JSON response
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (e) {
      // If not JSON, create a default response
      parsedResponse = {
        text: responseText,
        action: 'none',
        prompt: text,
        suggestions: [],
      };
    }

    console.log('Gemini Live message response:', {
      action: parsedResponse.action,
      textLength: parsedResponse.text?.length || 0,
    });

    return NextResponse.json({
      response: parsedResponse,
      success: true,
    });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      {
        error: 'Failed to process message',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

