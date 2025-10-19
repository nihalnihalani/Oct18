/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Client-side video generation service (from veo-studio)
 */
import {
  GoogleGenAI,
  Video,
  VideoGenerationReferenceImage,
  VideoGenerationReferenceType,
} from '@google/genai';
import { GenerateVideoParams, GenerationMode } from '@/types';

export const generateVideoClientSide = async (
  params: GenerateVideoParams,
  apiKey: string,
  onProgress?: (message: string) => void,
): Promise<{objectUrl: string; blob: Blob; uri: string; video: Video}> => {
  console.log('Starting client-side video generation with params:', params);
  
  onProgress?.('Initializing AI model...');
  const ai = new GoogleGenAI({apiKey});

  const config: any = {
    numberOfVideos: 1,
    resolution: params.resolution,
  };

  // Conditionally add aspect ratio (not used for extending videos)
  if (params.mode !== GenerationMode.EXTEND_VIDEO) {
    config.aspectRatio = params.aspectRatio;
  }

  // Add negative prompt if provided
  if (params.negativePrompt) {
    config.negativePrompt = params.negativePrompt;
  }

  const generateVideoPayload: any = {
    model: params.model,
    config: config,
  };

  // Only add the prompt if it's not empty
  if (params.prompt) {
    generateVideoPayload.prompt = params.prompt;
  }

  // Handle different generation modes
  if (params.mode === GenerationMode.IMAGE_TO_VIDEO && params.image) {
    generateVideoPayload.image = {
      imageBytes: params.image.base64,
      mimeType: params.image.file.type,
    };
    console.log('Image to video mode: image attached');
  } else if (params.mode === GenerationMode.FRAMES_TO_VIDEO) {
    if (params.startFrame) {
      generateVideoPayload.image = {
        imageBytes: params.startFrame.base64,
        mimeType: params.startFrame.file.type,
      };
      console.log(`Generating with start frame: ${params.startFrame.file.name}`);
    }

    const finalEndFrame = params.isLooping
      ? params.startFrame
      : params.endFrame;
      
    if (finalEndFrame) {
      generateVideoPayload.config.lastFrame = {
        imageBytes: finalEndFrame.base64,
        mimeType: finalEndFrame.file.type,
      };
      if (params.isLooping) {
        console.log('Generating a looping video using start frame as end frame');
      } else {
        console.log(`Generating with end frame: ${params.endFrame?.file.name}`);
      }
    }
  } else if (params.mode === GenerationMode.REFERENCES_TO_VIDEO) {
    const referenceImagesPayload: VideoGenerationReferenceImage[] = [];

    if (params.referenceImages) {
      for (const img of params.referenceImages) {
        console.log(`Adding reference image: ${img.file.name}`);
        referenceImagesPayload.push({
          image: {
            imageBytes: img.base64,
            mimeType: img.file.type,
          },
          referenceType: VideoGenerationReferenceType.ASSET,
        });
      }
    }

    if (params.styleImage) {
      console.log(`Adding style image: ${params.styleImage.file.name}`);
      referenceImagesPayload.push({
        image: {
          imageBytes: params.styleImage.base64,
          mimeType: params.styleImage.file.type,
        },
        referenceType: VideoGenerationReferenceType.STYLE,
      });
    }

    if (referenceImagesPayload.length > 0) {
      generateVideoPayload.config.referenceImages = referenceImagesPayload;
    }
  } else if (params.mode === GenerationMode.EXTEND_VIDEO) {
    if (params.inputVideoObject) {
      generateVideoPayload.video = params.inputVideoObject;
      console.log('Generating extension from input video object');
    } else {
      throw new Error('An input video object is required to extend a video.');
    }
  }

  console.log('Submitting video generation request...');
  onProgress?.('Submitting generation request...');
  
  let operation = await ai.models.generateVideos(generateVideoPayload);
  console.log('Video generation operation started:', operation);

  // Poll until complete
  let pollCount = 0;
  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 second intervals
    pollCount++;
    console.log(`...Polling (${pollCount})...`);
    onProgress?.(`Generating video... (${pollCount * 10}s elapsed)`);
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  console.log('Generation complete!');
  onProgress?.('Download starting...');

  if (operation?.response) {
    const videos = operation.response.generatedVideos;

    if (!videos || videos.length === 0) {
      throw new Error('No videos were generated.');
    }

    const firstVideo = videos[0];
    if (!firstVideo?.video?.uri) {
      throw new Error('Generated video is missing a URI.');
    }
    const videoObject = firstVideo.video;

    const url = decodeURIComponent(videoObject.uri);
    console.log('Fetching video from:', url);

    // Fetch the video with API key
    const res = await fetch(`${url}&key=${apiKey}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch video: ${res.status} ${res.statusText}`);
    }

    onProgress?.('Downloading video...');
    const videoBlob = await res.blob();
    const objectUrl = URL.createObjectURL(videoBlob);

    console.log('Video ready! Blob size:', videoBlob.size);
    onProgress?.('Complete!');

    return {objectUrl, blob: videoBlob, uri: url, video: videoObject};
  } else {
    console.error('Operation failed:', operation);
    throw new Error('No videos generated.');
  }
};

