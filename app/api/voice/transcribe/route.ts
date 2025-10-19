import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    console.log("Transcribing audio file:", audioFile.name, "Size:", audioFile.size);

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");
    
    // Get MIME type
    const mimeType = audioFile.type || "audio/webm";

    console.log("Audio MIME type:", mimeType);

    // Use Gemini to transcribe the audio
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              data: base64Audio,
              mimeType: mimeType,
            },
          },
          {
            text: "Please transcribe this audio to text. Return only the transcribed text without any additional commentary or formatting.",
          },
        ],
      }],
    });

    const transcription = result.text || '';

    console.log("Transcription result:", transcription);

    return NextResponse.json({ 
      transcription: transcription.trim(),
      success: true 
    });

  } catch (error) {
    console.error("Error transcribing audio:", error);
    return NextResponse.json(
      { 
        error: `Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false 
      },
      { status: 500 }
    );
  }
}
