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
    const model = (body?.model as string) || "imagen-3.0-generate-001";

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    console.log("Generating image with model:", model, "prompt:", prompt);

    const resp = await ai.models.generateImages({
      model,
      prompt,
      config: {
        aspectRatio: "16:9",
      },
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
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
