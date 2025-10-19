"use client";

import React, { useState } from 'react';
import { X, Wand2, Loader2 } from 'lucide-react';

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
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300 mb-2">
              Video text prompt
            </label>
            <textarea
              id="description"
              rows={10}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow duration-200 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the video you want to create... Be specific about scenes, actions, and style."
              aria-label={`Edit description for the video`}
            />
            <p className="text-xs text-gray-400 mt-2">
              Modify the prompt above to generate a new variation of this video using Veo 3.
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
