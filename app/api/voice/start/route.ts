import { NextResponse } from 'next/server';

/**
 * Voice bot connection endpoint
 * Connects to Pipecat voice server running Gemini Live
 */
export async function POST() {
  const botStartUrl = process.env.BOT_START_URL || 'http://localhost:7860/start';

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (process.env.BOT_START_PUBLIC_API_KEY) {
      headers.Authorization = `Bearer ${process.env.BOT_START_PUBLIC_API_KEY}`;
    }

    const response = await fetch(botStartUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        createDailyRoom: true,
        dailyRoomProperties: { 
          start_video_off: true,
          start_audio_off: false,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Bot connection failed:', data);
      throw new Error(`Bot returned ${response.status}: ${response.statusText}`);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Voice connection error:', error);
    return NextResponse.json(
      { 
        error: `Voice connection failed: ${error}`,
        message: 'Make sure the voice server is running on port 7860'
      },
      { status: 500 }
    );
  }
}
