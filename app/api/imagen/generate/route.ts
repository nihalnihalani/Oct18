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

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    console.log("Generating image with prompt:", prompt);

    // Use the correct Gemini model for image generation
    const model = 'gemini-2.5-flash-image-preview';
    
    try {
      console.log(`Using model: ${model}`);
      
      const resp = await ai.models.generateImages({
        model,
        prompt,
      });

      console.log(`Image generation response for ${model}:`, resp);

      const image = resp.generatedImages?.[0]?.image;
      if (image?.imageBytes) {
        console.log(`Success with model: ${model}`);
        return NextResponse.json({
          image: {
            imageBytes: image.imageBytes,
            mimeType: image.mimeType || "image/png",
          },
        });
      } else {
        console.error("No image returned from API");
        return NextResponse.json({ error: "No image returned" }, { status: 500 });
      }
    } catch (modelError) {
      console.error(`Model ${model} failed:`, modelError);
      return NextResponse.json(
        { error: `Image generation failed: ${modelError instanceof Error ? modelError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
