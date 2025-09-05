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

    // Try different approaches for image generation
    try {
      // First try: Direct model call
      const resp = await ai.models.generateImages({
        model: "imagen-3.0-generate-001",
        prompt,
      });

      console.log("Image generation response:", resp);

      const image = resp.generatedImages?.[0]?.image;
      if (!image?.imageBytes) {
        console.error("No image returned from API");
        return NextResponse.json({ error: "No image returned" }, { status: 500 });
      }

      return NextResponse.json({
        image: {
          imageBytes: image.imageBytes,
          mimeType: image.mimeType || "image/png",
        },
      });
    } catch (apiError) {
      console.error("First API attempt failed:", apiError);
      
      // Second try: Different model
      try {
        const resp2 = await ai.models.generateImages({
          model: "imagen-3.0-generate-001",
          prompt,
          config: {
            aspectRatio: "16:9",
          },
        });

        console.log("Second image generation response:", resp2);

        const image = resp2.generatedImages?.[0]?.image;
        if (!image?.imageBytes) {
          console.error("No image returned from second API attempt");
          return NextResponse.json({ error: "No image returned" }, { status: 500 });
        }

        return NextResponse.json({
          image: {
            imageBytes: image.imageBytes,
            mimeType: image.mimeType || "image/png",
          },
        });
      } catch (apiError2) {
        console.error("Second API attempt failed:", apiError2);
        throw apiError2;
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
