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

    const config = {
      responseModalities: [
        'IMAGE',
        'TEXT',
      ],
    };
    const model = 'gemini-2.5-flash-image-preview';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    console.log("Using model:", model);
    console.log("Config:", config);

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let imageData: { data: string; mimeType: string } | null = null;
    let textResponse = "";

    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        continue;
      }
      
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const inlineData = chunk.candidates[0].content.parts[0].inlineData;
        imageData = {
          data: inlineData.data || '',
          mimeType: inlineData.mimeType || 'image/png'
        };
        console.log("Received image data:", imageData.mimeType);
      } else if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
        textResponse += chunk.candidates[0].content.parts[0].text;
        console.log("Received text:", chunk.candidates[0].content.parts[0].text);
      }
    }

    if (imageData) {
      console.log("Successfully generated image");
      return NextResponse.json({
        image: {
          imageBytes: imageData.data,
          mimeType: imageData.mimeType,
        },
        text: textResponse || undefined,
      });
    } else {
      console.error("No image data received");
      return NextResponse.json(
        { 
          error: "No image data received from the API",
          text: textResponse || undefined,
          debug: "The API responded but didn't include image data"
        },
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
