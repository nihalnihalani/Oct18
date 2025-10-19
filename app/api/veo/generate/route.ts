/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Enhanced video generation API supporting all modes
 */
import { NextResponse } from "next/server";
import { GoogleGenAI, VideoGenerationReferenceImage, VideoGenerationReferenceType } from "@google/genai";
import { GenerationMode } from "@/types";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }

    const form = await req.formData();

    // Common parameters
    const prompt = (form.get("prompt") as string) || "";
    const model = (form.get("model") as string) || "veo-3.0-generate-preview";
    const negativePrompt = (form.get("negativePrompt") as string) || undefined;
    const aspectRatio = (form.get("aspectRatio") as string) || undefined;
    const resolution = (form.get("resolution") as string) || "720p";
    const mode = (form.get("mode") as string) || GenerationMode.TEXT_TO_VIDEO;

    console.log("Video generation request:", {
      prompt: prompt.substring(0, 50) + "...",
      model,
      mode,
      aspectRatio,
      resolution,
      negativePrompt: !!negativePrompt
    });

    const config: any = {
      numberOfVideos: 1,
    };

    // Only add resolution for models that support it (Veo 3.1+)
    if (model.includes('veo-3.1') || model.includes('veo-2')) {
      config.resolution = resolution;
    }

    // Add aspect ratio (not used for extend mode)
    if (mode !== GenerationMode.EXTEND_VIDEO && aspectRatio) {
      config.aspectRatio = aspectRatio;
    }

    // Add negative prompt if provided
    if (negativePrompt) {
      config.negativePrompt = negativePrompt;
    }

    const generateVideoPayload: any = {
      model,
      config,
    };

    // Add prompt if provided
    if (prompt) {
      generateVideoPayload.prompt = prompt;
    }

    // Handle different generation modes
    switch (mode) {
      case GenerationMode.IMAGE_TO_VIDEO: {
        const imageFile = form.get("imageFile");
        const imageBase64 = (form.get("imageBase64") as string) || undefined;
        const imageMimeType = (form.get("imageMimeType") as string) || undefined;

    let image: { imageBytes: string; mimeType: string } | undefined;

    if (imageFile && imageFile instanceof File) {
          const b64 = await fileToBase64(imageFile);
      image = { imageBytes: b64, mimeType: imageFile.type || "image/png" };
    } else if (imageBase64) {
      const cleaned = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;
      image = { imageBytes: cleaned, mimeType: imageMimeType || "image/png" };
    }

        if (image) {
          generateVideoPayload.image = image;
          console.log("Image to video mode: image attached");
        }
        break;
      }

      case GenerationMode.FRAMES_TO_VIDEO: {
        const startFrameFile = form.get("startFrame");
        const startFrameBase64 = (form.get("startFrameBase64") as string) || undefined;
        const endFrameFile = form.get("endFrame");
        const endFrameBase64 = (form.get("endFrameBase64") as string) || undefined;
        const isLooping = form.get("isLooping") === "true";

        // Start frame
        if (startFrameBase64) {
          const mimeType = startFrameFile instanceof File ? startFrameFile.type : 'image/png';
          generateVideoPayload.image = {
            imageBytes: startFrameBase64,
            mimeType,
          };
          console.log("Frames to video mode: start frame attached (from base64)");
        } else if (startFrameFile && startFrameFile instanceof File) {
          const b64 = await fileToBase64(startFrameFile);
          generateVideoPayload.image = {
            imageBytes: b64,
            mimeType: startFrameFile.type,
          };
          console.log("Frames to video mode: start frame attached (converted)");
        }

        // End frame (or loop to start)
        if (isLooping && startFrameBase64) {
          const mimeType = startFrameFile instanceof File ? startFrameFile.type : 'image/png';
          config.lastFrame = {
            imageBytes: startFrameBase64,
            mimeType,
          };
          console.log("Looping video: using start frame as end frame");
        } else if (endFrameBase64) {
          const mimeType = endFrameFile instanceof File ? endFrameFile.type : 'image/png';
          config.lastFrame = {
            imageBytes: endFrameBase64,
            mimeType,
          };
          console.log("Frames to video mode: end frame attached (from base64)");
        } else if (endFrameFile && endFrameFile instanceof File) {
          const b64 = await fileToBase64(endFrameFile);
          config.lastFrame = {
            imageBytes: b64,
            mimeType: endFrameFile.type,
          };
          console.log("Frames to video mode: end frame attached (converted)");
        }
        break;
      }

      case GenerationMode.REFERENCES_TO_VIDEO: {
        const referenceImagesPayload: VideoGenerationReferenceImage[] = [];

        // Add reference images
        let index = 0;
        while (form.has(`referenceImage${index}`) || form.has(`referenceImage${index}Base64`)) {
          const refImageBase64 = (form.get(`referenceImage${index}Base64`) as string) || undefined;
          const refImage = form.get(`referenceImage${index}`);
          
          if (refImageBase64) {
            const mimeType = refImage instanceof File ? refImage.type : 'image/png';
            referenceImagesPayload.push({
              image: {
                imageBytes: refImageBase64,
                mimeType,
              },
              referenceType: VideoGenerationReferenceType.ASSET,
            });
            console.log(`Added reference image ${index} (from base64)`);
          } else if (refImage && refImage instanceof File) {
            const b64 = await fileToBase64(refImage);
            referenceImagesPayload.push({
              image: {
                imageBytes: b64,
                mimeType: refImage.type,
              },
              referenceType: VideoGenerationReferenceType.ASSET,
            });
            console.log(`Added reference image ${index} (converted)`);
          }
          index++;
        }

        // Add style image
        const styleImageBase64 = (form.get("styleImageBase64") as string) || undefined;
        const styleImageFile = form.get("styleImage");
        
        if (styleImageBase64) {
          const mimeType = styleImageFile instanceof File ? styleImageFile.type : 'image/png';
          referenceImagesPayload.push({
            image: {
              imageBytes: styleImageBase64,
              mimeType,
            },
            referenceType: VideoGenerationReferenceType.STYLE,
          });
          console.log("Added style image (from base64)");
        } else if (styleImageFile && styleImageFile instanceof File) {
          const b64 = await fileToBase64(styleImageFile);
          referenceImagesPayload.push({
            image: {
              imageBytes: b64,
              mimeType: styleImageFile.type,
            },
            referenceType: VideoGenerationReferenceType.STYLE,
          });
          console.log("Added style image (converted)");
        }

        if (referenceImagesPayload.length > 0) {
          config.referenceImages = referenceImagesPayload;
        }
        break;
      }

      case GenerationMode.EXTEND_VIDEO: {
        const inputVideoUri = (form.get("inputVideoUri") as string) || undefined;
        
        if (inputVideoUri) {
          generateVideoPayload.video = { uri: inputVideoUri };
          console.log("Extend video mode: video URI attached");
        } else {
          return NextResponse.json(
            { error: "Video URI required for extend mode" },
            { status: 400 }
          );
        }
        break;
      }

      default:
        // TEXT_TO_VIDEO - no additional parameters needed
        break;
    }

    if (!prompt && mode !== GenerationMode.EXTEND_VIDEO) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    console.log("Submitting generation request...", {
      model: generateVideoPayload.model,
      config: generateVideoPayload.config,
      hasPrompt: !!generateVideoPayload.prompt,
      hasImage: !!generateVideoPayload.image,
      hasVideo: !!generateVideoPayload.video,
    });

    const operation = await ai.models.generateVideos(generateVideoPayload);

    const name = (operation as unknown as { name?: string }).name;
    console.log("Video generation started:", name);
    
    return NextResponse.json({ name });
  } catch (error: unknown) {
    console.error("Error starting Veo generation:", error);
    return NextResponse.json(
      { 
        error: "Failed to start generation",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
