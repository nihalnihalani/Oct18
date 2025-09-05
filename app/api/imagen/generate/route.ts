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

    // Try different models and approaches
    const modelsToTry = [
      "imagen-3.0-generate-001",
      "imagen-3.0-fast-generate-001", 
      "imagen-3.0-generate",
      "imagen-3.0-fast-generate"
    ];

    for (const model of modelsToTry) {
      try {
        console.log(`Trying model: ${model}`);
        
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
        }
      } catch (modelError) {
        console.error(`Model ${model} failed:`, modelError);
        continue; // Try next model
      }
    }

    // If all models fail, try without specifying model
    try {
      console.log("Trying without specifying model");
      const resp = await ai.models.generateImages({
        prompt,
      });

      console.log("Image generation response (no model):", resp);

      const image = resp.generatedImages?.[0]?.image;
      if (image?.imageBytes) {
        console.log("Success without specifying model");
        return NextResponse.json({
          image: {
            imageBytes: image.imageBytes,
            mimeType: image.mimeType || "image/png",
          },
        });
      }
    } catch (noModelError) {
      console.error("No model specified failed:", noModelError);
    }

    // All attempts failed
    return NextResponse.json(
      { error: "All image generation attempts failed. Please check your API key and model access." },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
