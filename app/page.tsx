"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Clock, X } from "lucide-react";
import Composer from "@/components/ui/Composer";
import VideoPlayer from "@/components/ui/VideoPlayer";

type VeoOperationName = string | null;

const POLL_INTERVAL_MS = 5000;

const VeoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState(""); // Video prompt
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedModel, setSelectedModel] = useState(
    "veo-3.0-generate-preview"
  );

  // Imagen-specific prompt
  const [imagePrompt, setImagePrompt] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagenBusy, setImagenBusy] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // data URL

  const [operationName, setOperationName] = useState<VeoOperationName>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoBlobRef = useRef<Blob | null>(null);
  const trimmedBlobRef = useRef<Blob | null>(null);
  const trimmedUrlRef = useRef<string | null>(null);
  const originalVideoUrlRef = useRef<string | null>(null);

  const [showImageTools, setShowImageTools] = useState(false);

  const canStart = useMemo(() => {
    const hasPrompt = !!prompt.trim();
    const hasImage = !!(imageFile || generatedImage);
    const needsImage = showImageTools;
    const canStartResult = hasPrompt && (!needsImage || hasImage);
    
    console.log("canStart check:", {
      hasPrompt,
      hasImage,
      needsImage,
      canStartResult,
      prompt: prompt.substring(0, 30) + "...",
      showImageTools
    });
    
    return canStartResult;
  }, [prompt, showImageTools, imageFile, generatedImage]);

  const resetAll = () => {
    setPrompt("");
    setNegativePrompt("");
    setAspectRatio("16:9");
    setImagePrompt("");
    setImageFile(null);
    setGeneratedImage(null);
    setOperationName(null);
    setIsGenerating(false);
    setIsDownloading(false);
    setVideoUrl(null);
    if (videoBlobRef.current) {
      URL.revokeObjectURL(URL.createObjectURL(videoBlobRef.current));
      videoBlobRef.current = null;
    }
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
  };

  const closeVideo = () => {
    setVideoUrl(null);
    if (videoBlobRef.current) {
      URL.revokeObjectURL(URL.createObjectURL(videoBlobRef.current));
      videoBlobRef.current = null;
    }
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
    originalVideoUrlRef.current = null;
  };

  const closeGeneratedImage = () => {
    setGeneratedImage(null);
  };

  // Imagen helper
  const generateWithImagen = useCallback(async () => {
    console.log("generateWithImagen called with prompt:", imagePrompt);
    setImagenBusy(true);
    setGeneratedImage(null);
    try {
      console.log("Generating image with prompt:", imagePrompt);
      const resp = await fetch("/api/imagen/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      
      console.log("Image generation response status:", resp.status);
      
      if (!resp.ok) {
        const errorData = await resp.json();
        console.error("Image generation failed:", errorData);
        alert(`Image generation failed: ${errorData.error || 'Unknown error'}`);
        return;
      }
      
      const json = await resp.json();
      console.log("Image generation response:", json);
      
      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
        console.log("Image generated successfully");
        alert("Image generated successfully!");
      } else {
        console.error("No image data in response:", json);
        alert("No image data received from server");
      }
    } catch (e) {
      console.error("Image generation error:", e);
      alert(`Image generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setImagenBusy(false);
    }
  }, [imagePrompt]);

  // Start Veo job
  const startGeneration = useCallback(async () => {
    if (!canStart) return;
    setIsGenerating(true);
    setVideoUrl(null);

    console.log("Starting video generation with:", {
      prompt: prompt.substring(0, 50) + "...",
      model: selectedModel,
      aspectRatio,
      hasImage: !!(imageFile || generatedImage),
      showImageTools
    });

    const form = new FormData();
    form.append("prompt", prompt);
    form.append("model", selectedModel);
    if (negativePrompt) form.append("negativePrompt", negativePrompt);
    if (aspectRatio) form.append("aspectRatio", aspectRatio);

    if (showImageTools) {
      if (imageFile) {
        form.append("imageFile", imageFile);
        console.log("Using uploaded image file:", imageFile.name);
      } else if (generatedImage) {
        const [meta, b64] = generatedImage.split(",");
        const mime = meta?.split(";")?.[0]?.replace("data:", "") || "image/png";
        form.append("imageBase64", b64);
        form.append("imageMimeType", mime);
        console.log("Using generated image");
      }
    }

    try {
      const resp = await fetch("/api/veo/generate", {
        method: "POST",
        body: form,
      });
      
      if (!resp.ok) {
        const errorData = await resp.json();
        console.error("Video generation failed:", errorData);
        alert(`Video generation failed: ${errorData.error || 'Unknown error'}`);
        setIsGenerating(false);
        return;
      }
      
      const json = await resp.json();
      console.log("Video generation response:", json);
      
      if (json?.name) {
        setOperationName(json.name);
        console.log("Video generation started successfully:", json.name);
      } else {
        console.error("No operation name in response:", json);
        alert("No operation name received from server");
        setIsGenerating(false);
      }
    } catch (e) {
      console.error("Video generation error:", e);
      alert(`Video generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setIsGenerating(false);
    }
  }, [
    canStart,
    prompt,
    selectedModel,
    negativePrompt,
    aspectRatio,
    showImageTools,
    imageFile,
    generatedImage,
  ]);

  // Poll operation until done then download
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function poll() {
      if (!operationName || videoUrl) return;
      try {
        const resp = await fetch("/api/veo/operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: operationName }),
        });
        const fresh = await resp.json();
        console.log("Polling response:", fresh);
        
        if (fresh?.done) {
          console.log("Operation completed, looking for video URI...");
          
          // Try multiple possible response structures
          let fileUri = fresh?.response?.generatedVideos?.[0]?.video?.uri;
          
          if (!fileUri) {
            // Try alternative structure
            fileUri = fresh?.response?.video?.uri;
          }
          
          if (!fileUri) {
            // Try another alternative structure
            fileUri = fresh?.result?.generatedVideos?.[0]?.video?.uri;
          }
          
          if (!fileUri) {
            // Try direct result structure
            fileUri = fresh?.result?.video?.uri;
          }
          
          console.log("Found file URI:", fileUri);
          
          if (fileUri) {
            console.log("Downloading video from URI:", fileUri);
            setIsDownloading(true);
            
            const dl = await fetch("/api/veo/download", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uri: fileUri }),
            });
            
            if (!dl.ok) {
              console.error("Download failed:", dl.status, dl.statusText);
              const errorText = await dl.text();
              console.error("Download error details:", errorText);
              setIsGenerating(false);
              setIsDownloading(false);
              return;
            }
            
            const blob = await dl.blob();
            console.log("Downloaded blob:", blob.size, "bytes, type:", blob.type);
            
            videoBlobRef.current = blob;
            const url = URL.createObjectURL(blob);
            console.log("Created video URL:", url);
            setVideoUrl(url);
            originalVideoUrlRef.current = url;
            setIsDownloading(false);
          } else {
            console.error("No file URI found in response. Full response structure:", fresh);
          }
          setIsGenerating(false);
          return;
        }
      } catch (e) {
        console.error(e);
        setIsGenerating(false);
      } finally {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }
    if (operationName && !videoUrl) {
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [operationName, videoUrl]);

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setImageFile(f);
      setGeneratedImage(null);
    }
  };

  const handleTrimmedOutput = (blob: Blob) => {
    trimmedBlobRef.current = blob; // likely webm
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
    }
    trimmedUrlRef.current = URL.createObjectURL(blob);
    setVideoUrl(trimmedUrlRef.current);
  };

  const handleResetTrimState = () => {
    if (trimmedUrlRef.current) {
      URL.revokeObjectURL(trimmedUrlRef.current);
      trimmedUrlRef.current = null;
    }
    trimmedBlobRef.current = null;
    if (originalVideoUrlRef.current) {
      setVideoUrl(originalVideoUrlRef.current);
    }
  };

  const downloadVideo = async () => {
    const blob = trimmedBlobRef.current || videoBlobRef.current;
    if (!blob) return;
    const isTrimmed = !!trimmedBlobRef.current;
    const filename = isTrimmed ? "veo3_video_trimmed.webm" : "veo3_video.mp4";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = url;
    link.setAttribute("download", filename);
    link.setAttribute("rel", "noopener");
    link.target = "_self";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">V3</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Veo 3 Studio
                </h1>
                <p className="text-gray-400 text-sm">Next-Gen AI Video Creation</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>API Connected</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-8 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!videoUrl ? (
            <div className="text-center py-20">
              {isGenerating || isDownloading ? (
                <div className="max-w-md mx-auto">
                  <div className="relative">
                    <div className="w-32 h-32 mx-auto mb-8 relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin"></div>
                      <div className="absolute inset-2 rounded-full bg-gray-900 flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {isGenerating ? "Creating Magic..." : "Preparing Your Video..."}
                  </h2>
                  <p className="text-gray-400 text-lg">
                    {isGenerating ? "Our AI is crafting your vision into reality" : "Almost ready to unveil your creation"}
                  </p>
                  <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-200"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-400"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <div className="mb-12">
                    <div className="w-40 h-40 mx-auto mb-8 relative group">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-2 rounded-2xl bg-gray-900 flex items-center justify-center">
                        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">🎥</div>
                      </div>
                    </div>
                    <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                      Create Cinematic Magic
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed mb-8">
                      Transform your ideas into stunning videos with Google's most advanced AI. 
                      From simple prompts to complex scenes, bring your imagination to life.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-colors duration-300">
                      <div className="text-3xl mb-4">✨</div>
                      <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
                      <p className="text-gray-400 text-sm">Advanced Veo 3 model for realistic video generation</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-pink-500 transition-colors duration-300">
                      <div className="text-3xl mb-4">🎨</div>
                      <h3 className="text-lg font-semibold mb-2">Creative Control</h3>
                      <p className="text-gray-400 text-sm">Customize aspect ratios, models, and visual styles</p>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-red-500 transition-colors duration-300">
                      <div className="text-3xl mb-4">⚡</div>
                      <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                      <p className="text-gray-400 text-sm">Generate high-quality videos in minutes, not hours</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8">
              <div className="max-w-6xl mx-auto">
                {/* Close Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={closeVideo}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/90 hover:bg-gray-700/90 text-gray-300 hover:text-white transition-all backdrop-blur-sm border border-gray-700 hover:border-gray-600 shadow-lg hover:shadow-xl transform hover:scale-105"
                    title="Close Video"
                  >
                    <X className="w-4 h-4" />
                    Close Video
                  </button>
                </div>
                
                <VideoPlayer
                  src={videoUrl}
                  onOutputChanged={handleTrimmedOutput}
                  onDownload={downloadVideo}
                  onResetTrim={handleResetTrimState}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <Composer
        prompt={prompt}
        setPrompt={setPrompt}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        canStart={canStart}
        isGenerating={isGenerating}
        startGeneration={startGeneration}
        showImageTools={showImageTools}
        setShowImageTools={setShowImageTools}
        imagePrompt={imagePrompt}
        setImagePrompt={setImagePrompt}
        imagenBusy={imagenBusy}
        onPickImage={onPickImage}
        generateWithImagen={generateWithImagen}
        imageFile={imageFile}
        generatedImage={generatedImage}
        resetAll={resetAll}
        closeGeneratedImage={closeGeneratedImage}
      />
    </div>
  );
};

export default VeoStudio;
