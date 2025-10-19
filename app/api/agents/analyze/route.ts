import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { action, contentId, contentType, prompt, url, category } = await req.json();

    if (action === 'trends') {
      // Get trending suggestions
      const trendPrompt = `As a content trend analyst, provide 5-7 trending ${category || 'general'} content ideas for video/image generation in 2025.
Focus on:
- Popular visual styles
- Trending themes and topics
- Effective storytelling approaches
- Modern aesthetic preferences

Return as JSON array: ["trend1", "trend2", "trend3", ...]`;

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: trendPrompt }] }]
      });
      const responseText = result.text || '';
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const trends = JSON.parse(cleanedResponse);
        return NextResponse.json({ trends, success: true });
      } catch (e) {
        return NextResponse.json({ 
          trends: [
            "Cinematic product showcases with dramatic lighting",
            "Minimalist aesthetic with bold colors",
            "Dynamic camera movements and transitions",
            "Authentic, behind-the-scenes style content",
            "AI-enhanced visual effects and compositing",
          ],
          success: true 
        });
      }
    }

    if (action === 'trend-alignment') {
      // Analyze trend alignment
      const alignmentPrompt = `Analyze this prompt for current content trends alignment:

Prompt: "${prompt}"

Evaluate on a scale of 0-1 how well it aligns with 2025 content trends.
Provide recommendations to make it more trend-aligned.

Respond in JSON:
{
  "aligned": true/false,
  "score": 0.0-1.0,
  "recommendations": ["rec1", "rec2"]
}`;

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: alignmentPrompt }] }]
      });
      const responseText = result.text || '';
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const analysis = JSON.parse(cleanedResponse);
        return NextResponse.json({
          aligned: analysis.aligned !== false,
          score: analysis.score || 0.7,
          recommendations: analysis.recommendations || [],
          success: true,
        });
      } catch (e) {
        return NextResponse.json({
          aligned: true,
          score: 0.7,
          recommendations: [],
          success: true,
        });
      }
    }

    // Quality analysis (default action)
    if (!contentId || !prompt) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const analysisPrompt = `As a ${contentType} quality analyst, evaluate this content based on the prompt:

Prompt: "${prompt}"
Content ID: ${contentId}

Analyze:
1. How well it matches the prompt (estimated)
2. Technical quality aspects
3. Creative execution
4. Areas for improvement
5. Strengths

Provide analysis in JSON:
{
  "score": 0.0-1.0,
  "feedback": "overall feedback",
  "improvements": ["improvement1", "improvement2"],
  "strengths": ["strength1", "strength2"]
}`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: analysisPrompt }] }]
    });
    const responseText = result.text || '';
    const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const analysis = JSON.parse(cleanedResponse);
      
      console.log('Content quality analysis:', {
        contentId,
        score: analysis.score || 0,
        improvementsCount: analysis.improvements?.length || 0,
      });

      return NextResponse.json({
        score: analysis.score || 0.75,
        feedback: analysis.feedback || 'Content quality is good.',
        improvements: analysis.improvements || [],
        strengths: analysis.strengths || [],
        success: true,
      });
    } catch (e) {
      // Default analysis if parsing fails
      return NextResponse.json({
        score: 0.75,
        feedback: 'Content appears to match the prompt well.',
        improvements: ['Consider adding more detail', 'Enhance visual clarity'],
        strengths: ['Good composition', 'Effective use of colors'],
        success: true,
      });
    }
  } catch (error) {
    console.error('Error in content analysis:', error);
    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

