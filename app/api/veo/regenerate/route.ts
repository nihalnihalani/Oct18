import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = (body?.prompt as string) || "";
    const model = (body?.model as string) || "veo-3.0-generate-preview";

    console.log("Video regeneration request:", {
      prompt: prompt.substring(0, 50) + "...",
      model,
    });

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Generate new video with Veo 3
    const operation = await ai.models.generateVideos({
      model,
      prompt,
      config: {
        aspectRatio: '16:9',
      },
    });

    const name = (operation as unknown as { name?: string }).name;
    console.log("Video regeneration started:", name);
    return NextResponse.json({ name });
  } catch (error: unknown) {
    console.error("Error starting video regeneration:", error);
    return NextResponse.json(
      { error: "Failed to start video regeneration" },
      { status: 500 }
    );
  }
}
