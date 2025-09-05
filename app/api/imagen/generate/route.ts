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

    // Check if generateImages method exists
    console.log("Available methods on ai.models:", Object.getOwnPropertyNames(ai.models));
    console.log("Available methods on ai:", Object.getOwnPropertyNames(ai));

    // Try different approaches
    try {
      // First try: Check if generateImages exists
      if (typeof ai.models.generateImages === 'function') {
        console.log("generateImages method exists, trying...");
        
        const resp = await ai.models.generateImages({
          prompt,
        });

        console.log("Image generation response:", resp);

        const image = resp.generatedImages?.[0]?.image;
        if (image?.imageBytes) {
          console.log("Success with generateImages");
          return NextResponse.json({
            image: {
              imageBytes: image.imageBytes,
              mimeType: image.mimeType || "image/png",
            },
          });
        }
      } else {
        console.log("generateImages method does not exist");
      }
    } catch (apiError) {
      console.error("generateImages failed:", apiError);
    }

    // Try alternative approach - maybe it's a different method
    try {
      console.log("Trying alternative approach...");
      
      // Check if there's a different method for image generation
      const resp = await ai.generateContent({
        model: 'gemini-1.5-flash',
        contents: [{
          parts: [{
            text: `Generate an image of: ${prompt}`
          }]
        }]
      });

      console.log("Alternative response:", resp);
      
      // This might not work for image generation, but let's see what we get
      return NextResponse.json({
        error: "Image generation not supported with current API method",
        debug: "Tried alternative approach but image generation may not be available"
      });
      
    } catch (altError) {
      console.error("Alternative approach failed:", altError);
    }

    // All attempts failed
    return NextResponse.json(
      { 
        error: "Image generation is not available with the current Google GenAI package. The generateImages method may not be supported or the models may not support image generation.",
        suggestion: "Consider using a different image generation service or check if image generation is available in your region."
      },
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
