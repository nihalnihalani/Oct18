"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Wand2, Loader2, Mic, MicOff, Square } from 'lucide-react';

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  prompt: string;
  model: string;
  createdAt: Date;
  thumbnail?: string;
}

interface EditVideoPageProps {
  video: GalleryItem;
  onSave: (updatedVideo: GalleryItem) => void;
  onCancel: () => void;
}

/**
 * A page that allows the user to edit the description of a video.
 * It provides input field for the description and buttons to save or cancel the changes.
 */
export const EditVideoPage: React.FC<EditVideoPageProps> = ({
  video,
  onSave,
  onCancel,
}) => {
  const [description, setDescription] = useState(video.prompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.transcription) {
        // Append the transcription to the existing description
        const newDescription = description + (description ? ' ' : '') + result.transcription;
        setDescription(newDescription);
        console.log('Voice transcription:', result.transcription);
      } else {
        console.error('Transcription failed:', result.error);
        alert('Failed to transcribe audio. Please try again.');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      alert('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    setIsGenerating(true);
    try {
      // Create updated video object with new prompt
      const updatedVideo: GalleryItem = {
        ...video,
        prompt: description,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // New ID for regenerated video
        createdAt: new Date(),
      };
      
      // Call the save function which will trigger video regeneration
      onSave(updatedVideo);
    } catch (error) {
      console.error('Error updating video:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-2xl bg-gray-800 p-6 md:p-8 rounded-lg shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Edit Video
          </h1>
          <button
            onClick={onCancel}
            className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <main>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300">
                Video text prompt
              </label>
              
              {/* Voice Recording Controls */}
              <div className="flex items-center gap-2">
                {isRecording && (
                  <div className="flex items-center gap-2 text-red-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
                  </div>
                )}
                
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={isTranscribing}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    title="Start voice recording"
                  >
                    <Mic className="w-4 h-4" />
                    Voice
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                    title="Stop recording"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </button>
                )}
                
                {isTranscribing && (
                  <div className="flex items-center gap-2 text-purple-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Transcribing...</span>
                  </div>
                )}
              </div>
            </div>
            
            <textarea
              id="description"
              rows={10}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the video you want to create... Be specific about scenes, actions, and style. You can also use voice input by clicking the Voice button."
              aria-label={`Edit description for the video`}
            />
            <p className="text-xs text-gray-400 mt-2">
              Modify the prompt above to generate a new variation of this video using Veo 3. 
              Use the Voice button to add voice input that will be transcribed and appended to your prompt.
            </p>
          </div>
        </main>

        <footer className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors"
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isGenerating || !description.trim()}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate new video
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default EditVideoPage;
