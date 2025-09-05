"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Clock } from "lucide-react";
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoBlobRef = useRef<Blob | null>(null);
  const trimmedBlobRef = useRef<Blob | null>(null);
  const trimmedUrlRef = useRef<string | null>(null);
  const originalVideoUrlRef = useRef<string | null>(null);

  const [showImageTools, setShowImageTools] = useState(false);

  const canStart = useMemo(() => {
    if (!prompt.trim()) return false;
    if (showImageTools && !(imageFile || generatedImage)) return false;
    return true;
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

  // Imagen helper
  const generateWithImagen = useCallback(async () => {
    setImagenBusy(true);
    setGeneratedImage(null);
    try {
      const resp = await fetch("/api/imagen/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });
      const json = await resp.json();
      if (json?.image?.imageBytes) {
        const dataUrl = `data:${json.image.mimeType};base64,${json.image.imageBytes}`;
        setGeneratedImage(dataUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setImagenBusy(false);
    }
  }, [imagePrompt]);

  // Start Veo job
  const startGeneration = useCallback(async () => {
    if (!canStart) return;
    setIsGenerating(true);
    setVideoUrl(null);

    const form = new FormData();
    form.append("prompt", prompt);
    form.append("model", selectedModel);
    if (negativePrompt) form.append("negativePrompt", negativePrompt);
    if (aspectRatio) form.append("aspectRatio", aspectRatio);

    if (showImageTools) {
      if (imageFile) {
        form.append("imageFile", imageFile);
      } else if (generatedImage) {
        const [meta, b64] = generatedImage.split(",");
        const mime = meta?.split(";")?.[0]?.replace("data:", "") || "image/png";
        form.append("imageBase64", b64);
        form.append("imageMimeType", mime);
      }
    }

    try {
      const resp = await fetch("/api/veo/generate", {
        method: "POST",
        body: form,
      });
      const json = await resp.json();
      setOperationName(json?.name || null);
    } catch (e) {
      console.error(e);
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
        if (fresh?.done) {
          const fileUri = fresh?.response?.generatedVideos?.[0]?.video?.uri;
          if (fileUri) {
            const dl = await fetch("/api/veo/download", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ uri: fileUri }),
            });
            const blob = await dl.blob();
            videoBlobRef.current = blob;
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            originalVideoUrlRef.current = url;
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
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Header */}
      <div className="absolute top-6 left-6 z-20 hidden md:block animate-fadeInUp">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Veo 3 Studio</h1>
            <p className="text-sm text-slate-600">AI Video Generation</p>
          </div>
        </div>
      </div>

      {/* Center content */}
      <div className="flex items-center justify-center min-h-screen pb-40 px-4">
        {!videoUrl &&
          (isGenerating ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-700 font-medium">Generating your video...</span>
              </div>
              <p className="text-slate-500 text-sm mt-3">This may take a few minutes</p>
            </div>
          ) : (
            <div className="text-center max-w-md animate-fadeInUp">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <span className="text-white text-4xl">🎬</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Create Amazing Videos</h2>
              <p className="text-slate-600 leading-relaxed">
                Generate stunning videos from text prompts using Google's Veo 3 AI model. 
                Upload images or generate them with Imagen 4 for even more creative possibilities.
              </p>
            </div>
          ))}
        {videoUrl && (
          <div className="w-full max-w-4xl">
            <VideoPlayer
              src={videoUrl}
              onOutputChanged={handleTrimmedOutput}
              onDownload={downloadVideo}
              onResetTrim={handleResetTrimState}
            />
          </div>
        )}
      </div>

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
      />
    </div>
  );
};

export default VeoStudio;
