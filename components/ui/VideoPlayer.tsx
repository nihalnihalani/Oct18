"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Slider from "rc-slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Scissors,
  Download,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  // Called when a new output is produced (e.g., after trimming and exporting)
  onOutputChanged?: (blob: Blob) => void;
  onDownload?: () => void;
  onResetTrim?: () => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) {
    return "00:00";
  }
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
};

export default function VideoPlayer({
  src,
  onOutputChanged,
  onDownload,
  onResetTrim,
}: VideoPlayerProps) {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);
  const [isTrimmed, setIsTrimmed] = useState(false);
  const [effectiveDuration, setEffectiveDuration] = useState(0);
  const [effectiveStartTime, setEffectiveStartTime] = useState(0);
  const [showTrimBar, setShowTrimBar] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Reset trim UI when the source changes
  useEffect(() => {
    setIsTrimmed(false);
    setTrimRange([0, 0]);
    setDuration(0);
    setEffectiveDuration(0);
    setEffectiveStartTime(0);
    setPlayed(0);
    setSeeking(false);
    try {
      playerRef.current?.load?.();
    } catch {}
  }, [src]);

  useEffect(() => {
    // Ensure consistent mute/volume on element
    if (playerRef.current) {
      playerRef.current.muted = muted;
      playerRef.current.volume = volume;
    }
  }, [muted, volume]);

  const handlePlayPause = () => {
    if (!playerRef.current) return;
    setPlaying((p) => {
      const next = !p;
      if (next) {
        playerRef.current?.play().catch(() => {});
      } else {
        playerRef.current?.pause();
      }
      return next;
    });
  };

  const handleVolumeChange = (value: number | number[]) => {
    const newVolume = Array.isArray(value) ? value[0] : value;
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setVolume((prev) => (nextMuted ? 0 : prev === 0 ? 0.8 : prev));
  };

  const handleTimeUpdate = () => {
    const current = playerRef.current?.currentTime ?? 0;
    const rawTotal = playerRef.current?.duration;
    const total = Number.isFinite(rawTotal) && rawTotal ? rawTotal : duration;
    if (!seeking) {
      const denomRaw = isTrimmed ? effectiveDuration : total;
      const denom = Number.isFinite(denomRaw) && denomRaw > 0 ? denomRaw : 1;
      const numerator = current - (isTrimmed ? effectiveStartTime : 0);
      const fraction = Math.min(Math.max(numerator / denom, 0), 1);
      setPlayed(fraction);
      if (isTrimmed) {
        const endTime = effectiveStartTime + effectiveDuration;
        if (current >= endTime) {
          if (isRecording) {
            return;
          }
          const startTime = effectiveStartTime;
          if (playerRef.current) {
            if (typeof playerRef.current.fastSeek === "function") {
              playerRef.current.fastSeek(startTime);
            } else {
              playerRef.current.currentTime = startTime;
            }
            try {
              playerRef.current.play();
            } catch {}
          }
          setPlayed(0);
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    const video = playerRef.current;
    if (!video) return;
    const raw = video.duration;
    // Some MediaRecorder blobs report Infinity until a seek occurs
    if (!Number.isFinite(raw) || raw === Infinity || raw === 0) {
      const onSeeked = () => {
        // After seeking to a large time, duration becomes available
        const fixed = video.duration;
        const computed =
          Number.isFinite(fixed) && fixed > 0 ? fixed : video.currentTime || 0;
        setDuration(computed);
        setTrimRange([0, computed]);
        setEffectiveDuration(computed);
        setEffectiveStartTime(0);
        video.removeEventListener("seeked", onSeeked);
        try {
          if (typeof video.fastSeek === "function") {
            video.fastSeek(0);
          } else {
            video.currentTime = 0;
          }
        } catch {}
      };
      video.addEventListener("seeked", onSeeked);
      try {
        video.currentTime = 1e9;
      } catch {}
      return;
    }
    const d = raw;
    setDuration(d);
    setTrimRange([0, d]);
    setEffectiveDuration(d);
    setEffectiveStartTime(0);
  };

  const handleDurationChange = () => {
    const d = playerRef.current?.duration;
    if (Number.isFinite(d) && d && d !== Infinity) {
      setDuration(d);
      setTrimRange([0, d]);
      setEffectiveDuration(d);
      setEffectiveStartTime(0);
    }
  };

  const handleSeekChange = (value: number | number[]) => {
    const newPlayed = Array.isArray(value) ? value[0] : value;
    setPlayed(newPlayed);
    const spanRaw = isTrimmed ? effectiveDuration : duration;
    const span = Number.isFinite(spanRaw) && spanRaw > 0 ? spanRaw : 0;
    const seekToTime = newPlayed * span + (isTrimmed ? effectiveStartTime : 0);
    if (playerRef.current) {
      if (typeof playerRef.current.fastSeek === "function") {
        playerRef.current.fastSeek(seekToTime);
      } else {
        playerRef.current.currentTime = seekToTime;
      }
    }
  };

  const recordSegment = useCallback(
    async (startTime: number, endTime: number) => {
      const video = playerRef.current;
      if (!video || endTime <= startTime) return null;

      // Ensure captureStream is available
      try {
        await video.play();
        await new Promise((r) => setTimeout(r, 50));
        video.pause();
      } catch {}

      const v = video as HTMLVideoElement & {
        captureStream?(): MediaStream;
        mozCaptureStream?(): MediaStream;
      };
      const stream: MediaStream | null =
        v.captureStream?.() ?? v.mozCaptureStream?.() ?? null;
      if (!stream) return null;

      const mimeCandidates = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ];
      let mimeType = "";
      for (const m of mimeCandidates) {
        if (
          typeof MediaRecorder !== "undefined" &&
          MediaRecorder.isTypeSupported(m)
        ) {
          mimeType = m;
          break;
        }
      }

      const chunks: BlobPart[] = [];
      return await new Promise<Blob | null>((resolve) => {
        let resolved = false;
        const recorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined
        );
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = () => {
          if (resolved) return;
          resolved = true;
          setIsRecording(false);
          const type = recorder.mimeType || mimeType || "video/webm";
          resolve(new Blob(chunks, { type }));
        };
        recorder.onerror = () => {
          if (!resolved) {
            setIsRecording(false);
            resolve(null);
          }
        };

        const onTick = () => {
          const now = playerRef.current?.currentTime ?? 0;
          if (now >= endTime) {
            video.removeEventListener("timeupdate", onTick);
            try {
              recorder.stop();
            } catch {}
            try {
              video.pause();
            } catch {}
          }
        };
        video.addEventListener("timeupdate", onTick);
        if (typeof video.fastSeek === "function") {
          video.fastSeek(startTime);
        } else {
          video.currentTime = startTime;
        }
        // Use a small timeslice so dataavailable fires periodically and final blob isn't empty.
        try {
          setIsRecording(true);
          recorder.start(200);
        } catch {
          setIsRecording(true);
          recorder.start();
        }
        video.play();
      });
    },
    []
  );

  const handleTrim = useCallback(async () => {
    const startTime = trimRange[0];
    const endTime = trimRange[1];
    setEffectiveStartTime(startTime);
    setEffectiveDuration(Math.max(endTime - startTime, 0));
    setIsTrimmed(true);
    setPlaying(false);

    if (playerRef.current) {
      if (typeof playerRef.current.fastSeek === "function") {
        playerRef.current.fastSeek(startTime);
      } else {
        playerRef.current.currentTime = startTime;
      }
    }
    setPlayed(0);

    // Best-effort fallback recording to provide a quick preview blob
    const blob = await recordSegment(startTime, endTime);
    if (blob) {
      onOutputChanged?.(blob);
    }
  }, [trimRange, onOutputChanged, recordSegment]);

  const handleResetTrim = () => {
    setIsTrimmed(false);
    setTrimRange([0, duration]);
    setEffectiveDuration(duration);
    setEffectiveStartTime(0);
    if (playerRef.current) {
      if (typeof playerRef.current.fastSeek === "function") {
        playerRef.current.fastSeek(0);
      } else {
        playerRef.current.currentTime = 0;
      }
    }
    setPlayed(0);
    onResetTrim?.();
  };

  const handleTrimRangeChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setTrimRange(value as [number, number]);
    }
  };

  const spanForDisplay = isTrimmed ? effectiveDuration : duration;
  const safeDisplaySpan =
    Number.isFinite(spanForDisplay) && spanForDisplay > 0 ? spanForDisplay : 0;
  const currentDisplaySeconds = played * safeDisplaySpan;
  const totalDisplaySeconds = safeDisplaySpan;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="relative aspect-video overflow-hidden rounded-2xl shadow-2xl bg-slate-900">
        <video
          ref={playerRef}
          src={src}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onDurationChange={handleDurationChange}
          onPlay={() => {
            if (isTrimmed) {
              const currentTime = playerRef.current?.currentTime || 0;
              const startTime = trimRange[0];
              if (currentTime < startTime) {
                if (typeof playerRef.current?.fastSeek === "function") {
                  playerRef.current.fastSeek(startTime);
                } else if (playerRef.current) {
                  playerRef.current.currentTime = startTime;
                }
              }
            }
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          playsInline
          controls={false}
          preload="metadata"
          key={src}
          loop={!isTrimmed && !isRecording}
        />

        {/* Video overlay controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
              >
                {playing ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" />
                )}
              </button>
              
              <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Slider
                  min={0}
                  max={1}
                  step={0.0001}
                  value={played}
                  onBeforeChange={() => setSeeking(true)}
                  onChange={handleSeekChange}
                  onAfterChange={() => setSeeking(false)}
                  styles={{
                    track: { backgroundColor: "rgba(255,255,255,0.3)", height: 6 },
                    handle: { 
                      backgroundColor: "#3b82f6", 
                      borderColor: "#3b82f6",
                      width: 16,
                      height: 16,
                      marginTop: -5
                    },
                    rail: { backgroundColor: "rgba(255,255,255,0.2)", height: 6 }
                  }}
                />
              </div>
              
              <div className="text-white text-sm font-medium min-w-[80px] text-center">
                {formatTime(currentDisplaySeconds)} / {formatTime(totalDisplaySeconds)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom overlay trim bar (toggleable) */}
        {showTrimBar && (
          <div className="absolute left-0 right-0 bottom-2 z-20 px-4">
            <div className="backdrop-blur-md bg-white/90 rounded-2xl px-4 py-3 shadow-xl border border-white/20">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700 min-w-12 text-center">
                  {formatTime(trimRange[0])}
                </span>
                <div className="relative flex-1 h-8 flex">
                  <div
                    className="absolute inset-y-0 left-0 pointer-events-none z-0"
                    style={{
                      width: `${(trimRange[0] / (duration || 1)) * 100}%`,
                      backgroundColor: "rgba(0,0,0,0.3)",
                      borderRadius: 12,
                      height: 32,
                    }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 pointer-events-none z-0"
                    style={{
                      width: `${(1 - trimRange[1] / (duration || 1)) * 100}%`,
                      backgroundColor: "rgba(0,0,0,0.3)",
                      borderRadius: 12,
                      height: 32,
                    }}
                  />
                  <div className="relative z-10 w-full">
                    <Slider
                      range
                      min={0}
                      max={duration}
                      step={0.1}
                      value={trimRange}
                      onChange={handleTrimRangeChange}
                      disabled={duration === 0}
                      styles={{
                        rail: {
                          backgroundColor: "transparent",
                        },
                        track: { height: 32, backgroundColor: "transparent" },
                        handle: {
                          width: 12,
                          height: 32,
                          borderRadius: 6,
                          backgroundColor: "#3b82f6",
                          borderColor: "#3b82f6",
                          marginBottom: 0,
                        },
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-700 min-w-12 text-center">
                  {formatTime(trimRange[1])}
                </span>
                <div className="flex items-center gap-2 pl-2">
                  <button
                    onClick={handleTrim}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium cursor-pointer transition-all transform hover:scale-105"
                  >
                    <Scissors className="w-4 h-4" />
                    Cut
                  </button>
                  <button
                    onClick={handleResetTrim}
                    className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isTrimmed}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls below the video */}
      <div className="mt-6">
        <div className="flex items-center gap-4 backdrop-blur-md bg-white/90 rounded-2xl px-6 py-4 shadow-xl border border-white/20">
          <button
            onClick={handlePlayPause}
            className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-lg"
          >
            {playing ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>
          
          <div className="flex-grow">
            <Slider
              min={0}
              max={1}
              step={0.0001}
              value={played}
              onBeforeChange={() => setSeeking(true)}
              onChange={handleSeekChange}
              onAfterChange={() => setSeeking(false)}
              styles={{
                track: { backgroundColor: "#e2e8f0", height: 8 },
                handle: { 
                  backgroundColor: "#3b82f6", 
                  borderColor: "#3b82f6",
                  width: 20,
                  height: 20,
                  marginTop: -6
                },
                rail: { backgroundColor: "#f1f5f9", height: 8 }
              }}
            />
          </div>
          
          <div className="text-sm font-medium text-slate-700 min-w-[120px] text-center">
            {formatTime(currentDisplaySeconds)} / {formatTime(totalDisplaySeconds)}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 transition-all"
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            
            <div className="w-24">
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                styles={{
                  track: { backgroundColor: "#e2e8f0", height: 6 },
                  handle: { 
                    backgroundColor: "#3b82f6", 
                    borderColor: "#3b82f6",
                    width: 16,
                    height: 16,
                    marginTop: -5
                  },
                  rail: { backgroundColor: "#f1f5f9", height: 6 }
                }}
              />
            </div>
            
            <button
              onClick={() => setShowTrimBar((s) => !s)}
              title={showTrimBar ? "Hide trimmer" : "Show trimmer"}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                showTrimBar 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              <Scissors className="w-5 h-5" />
            </button>
            
            <button
              onClick={onDownload}
              title="Download"
              className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl flex items-center justify-center text-white transition-all transform hover:scale-105 shadow-lg"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
