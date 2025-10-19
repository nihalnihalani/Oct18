/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Operation polling - Fixed for @google/genai v1.22.0
 */
import { NextResponse } from "next/server";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = body.name as string | undefined;

    if (!name) {
      return NextResponse.json(
        { error: "Missing operation name" },
        { status: 400 }
      );
    }

    console.log("Polling operation:", name);

    // Use direct HTTP API call instead of SDK method
    // This is more compatible across SDK versions
    const operationUrl = `https://generativelanguage.googleapis.com/v1beta/${name}`;
    
    const response = await fetch(operationUrl, {
      method: 'GET',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY as string,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Operation polling failed:", response.status, errorText);
      return NextResponse.json(
        { 
          error: `Failed to poll operation: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const fresh = await response.json();
    console.log("Operation status:", fresh.done ? "DONE" : "PENDING");
    
    if (fresh.done) {
      console.log("✅ ============ Operation completed successfully ============");
      console.log("📦 SERVER SIDE - Full response structure:");
      console.log(JSON.stringify(fresh, null, 2));
      
      // Log what we're looking for
      console.log("\n🔍 Analyzing response structure:");
      if (fresh.response) {
        console.log("✓ fresh.response exists");
        if (fresh.response.generatedVideos) {
          console.log(`  ✓ generatedVideos array with ${fresh.response.generatedVideos.length} items`);
          fresh.response.generatedVideos.forEach((item: any, idx: number) => {
            console.log(`  - Item [${idx}]:`, JSON.stringify(item, null, 2));
            if (item.video) {
              console.log(`    🎬 Video object found:`, JSON.stringify(item.video, null, 2));
            }
            if (item.generatedVideo) {
              console.log(`    🎬 GeneratedVideo object found:`, JSON.stringify(item.generatedVideo, null, 2));
            }
          });
        } else {
          console.log("  ✗ No generatedVideos array");
        }
      } else {
        console.log("✗ fresh.response does NOT exist");
      }
      console.log("============ End of response analysis ============\n");
    }

    return NextResponse.json(fresh);
  } catch (error) {
    console.error("Error polling operation:", error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error details:", errorMessage);
    
    return NextResponse.json(
      { 
        error: "Failed to poll operation",
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
