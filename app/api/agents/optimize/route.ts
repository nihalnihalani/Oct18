import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt, contentType, mode } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    if (mode === 'suggestions') {
      // Get enhancement suggestions only
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: `Provide 3-5 creative suggestions to enhance this ${contentType} prompt. Return as a JSON array of strings.

Prompt: "${prompt}"

Return only a JSON array like: ["suggestion1", "suggestion2", "suggestion3"]` }] }]
      });

      const responseText = result.text || '';
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const suggestions = JSON.parse(cleanedResponse);
        return NextResponse.json({ suggestions });
      } catch (e) {
        return NextResponse.json({ suggestions: [] });
      }
    }

    // Optimize the prompt
    const optimizationPrompt = `You are a professional ${contentType} production expert. Optimize this prompt for AI generation:

Original prompt: "${prompt}"

Improve it by:
1. Adding cinematic/professional language
2. Specifying camera angles, lighting, or visual style
3. Making it more descriptive and vivid
4. Keeping the core idea intact

Respond in JSON format:
{
  "optimized": "the improved prompt",
  "improvements": ["improvement1", "improvement2"],
  "suggestions": ["additional suggestion1", "additional suggestion2"],
  "confidence": 0.85
}`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: optimizationPrompt }] }]
    });
    const responseText = result.text || '';
    
    // Clean and parse response
    const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanedResponse);
      
      console.log('Prompt optimization result:', {
        originalLength: prompt.length,
        optimizedLength: parsed.optimized?.length || 0,
        improvements: parsed.improvements?.length || 0,
      });

      return NextResponse.json({
        optimized: parsed.optimized || prompt,
        improvements: parsed.improvements || [],
        suggestions: parsed.suggestions || [],
        confidence: parsed.confidence || 0.8,
        success: true,
      });
    } catch (e) {
      // If parsing fails, return original prompt
      return NextResponse.json({
        optimized: prompt,
        improvements: [],
        suggestions: [],
        confidence: 0.5,
        success: true,
      });
    }
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    return NextResponse.json(
      {
        error: 'Failed to optimize prompt',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

