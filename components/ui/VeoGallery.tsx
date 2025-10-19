"use client";

import React, { useState, useRef } from "react";
import { X, Play, Pause, Download, Trash2, Eye, Calendar, Clock, Image as ImageIcon, Video, Grid3x3, List } from "lucide-react";
import NextImage from "next/image";
import { useGallery } from "@/contexts/GalleryContext";

// Custom icons
const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
  </svg>
);

export default function VeoGallery() {
  const {
    items: galleryItems,
    selectedItem: contextSelectedItem,
    setSelectedItem: setContextSelectedItem,
    filterType,
    setFilterType,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    deleteItem,
    downloadItem,
  } = useGallery();

  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set());
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const filteredItems = galleryItems
    .filter(item => filterType === 'all' || item.type === filterType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleVideoPlay = (itemId: string) => {
    const video = videoRefs.current[itemId];
    if (video) {
      if (playingVideos.has(itemId)) {
        video.pause();
        setPlayingVideos(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      } else {
        video.play();
        setPlayingVideos(prev => new Set(prev).add(itemId));
      }
    }
  };

  const handleDownload = (item: any) => {
    downloadItem(item);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this item from your gallery?')) {
      await deleteItem(id);
      if (contextSelectedItem?.id === id) {
        setContextSelectedItem(null);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Filters and Controls */}
      <div className="p-4 border-b border-gray-700 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Filter Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All ({galleryItems.length})
            </button>
            <button
              onClick={() => setFilterType('image')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'image'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Images ({galleryItems.filter(i => i.type === 'image').length})
            </button>
            <button
              onClick={() => setFilterType('video')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'video'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Video className="w-4 h-4 inline mr-1" />
              Videos ({galleryItems.filter(i => i.type === 'video').length})
            </button>
          </div>

          {/* View and Sort Controls */}
          <div className="flex items-center space-x-2">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="type">By Type</option>
            </select>

            {/* View Mode */}
            <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' ? 'bg-gray-700' : 'hover:bg-gray-700/50'
                }`}
              >
                <Grid3x3 className="w-4 h-4 text-gray-300" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' ? 'bg-gray-700' : 'hover:bg-gray-700/50'
                }`}
              >
                <List className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredItems.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-300">No items yet</h3>
              <p className="text-gray-500">
                Your generated images and videos will appear here
              </p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
              >
                {/* Media Preview */}
                <div className="relative aspect-video bg-black">
                  {item.type === 'image' ? (
                    <NextImage
                      src={item.src}
                      alt={item.prompt}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <video
                      ref={(el) => (videoRefs.current[item.id] = el)}
                      src={item.src}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                    />
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setContextSelectedItem(item)}
                      className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full transition-colors"
                      title="View Full Size"
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                    {item.type === 'video' && (
                      <button
                        onClick={() => handleVideoPlay(item.id)}
                        className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                        title={playingVideos.has(item.id) ? 'Pause' : 'Play'}
                      >
                        {playingVideos.has(item.id) ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <PlayIcon className="w-5 h-5 text-white" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-3 bg-green-600 hover:bg-green-700 rounded-full transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 rounded text-xs font-medium text-white flex items-center space-x-1">
                    {item.type === 'image' ? (
                      <>
                        <ImageIcon className="w-3 h-3" />
                        <span>Image</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-3 h-3" />
                        <span>Video</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Item Info */}
                <div className="p-3 space-y-2">
                  <p className="text-sm text-gray-300 line-clamp-2" title={item.prompt}>
                    {item.prompt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                      {item.model}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition-all"
              >
                {/* Thumbnail */}
                <div className="relative w-32 h-20 bg-black rounded overflow-hidden flex-shrink-0">
                  {item.type === 'image' ? (
                    <NextImage src={item.src} alt={item.prompt} fill className="object-cover" unoptimized />
                  ) : (
                    <video src={item.src} className="w-full h-full object-cover" muted />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 line-clamp-1">{item.prompt}</p>
                  <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      {item.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                      <span className="capitalize">{item.type}</span>
                    </span>
                    <span>{formatDate(item.createdAt)}</span>
                    <span className="px-2 py-0.5 bg-gray-700 rounded">{item.model}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setContextSelectedItem(item)}
                    className="p-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleDownload(item)}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Item Viewer */}
      {contextSelectedItem && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4">
          <div className="max-w-6xl w-full space-y-4">
            {/* Close Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-purple-600 rounded-full text-sm font-medium">
                  {contextSelectedItem.type === 'image' ? '🎨 Image' : '🎬 Video'}
                </span>
                <span className="text-gray-400 text-sm">{contextSelectedItem.model}</span>
              </div>
              <button
                onClick={() => setContextSelectedItem(null)}
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Media */}
            <div className="bg-black rounded-lg overflow-hidden border border-gray-700">
              {contextSelectedItem.type === 'image' ? (
                <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                  <NextImage
                    src={contextSelectedItem.src}
                    alt={contextSelectedItem.prompt}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <video
                  src={contextSelectedItem.src}
                  controls
                  autoPlay
                  loop
                  className="w-full"
                  style={{ maxHeight: '70vh' }}
                />
              )}
            </div>

            {/* Details */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Prompt</p>
                <p className="text-sm text-gray-300">{contextSelectedItem.prompt}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(contextSelectedItem.createdAt)}</span>
                </div>
                <span>Model: {contextSelectedItem.model}</span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2 border-t border-gray-700">
                <button
                  onClick={() => handleDownload(contextSelectedItem)}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleDelete(contextSelectedItem.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
