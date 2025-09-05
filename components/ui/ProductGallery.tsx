"use client";

import React, { useState, useRef } from "react";
import { X, Play, Pause, Download, Trash2, Eye, Calendar, Clock, Image as ImageIcon, Video } from "lucide-react";
import NextImage from "next/image";

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  prompt: string;
  model: string;
  createdAt: Date;
  thumbnail?: string;
}

interface ProductGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  galleryItems: GalleryItem[];
  onDeleteItem: (id: string) => void;
  onDownloadItem: (item: GalleryItem) => void;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({
  isOpen,
  onClose,
  galleryItems,
  onDeleteItem,
  onDownloadItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'type'>('newest');
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  if (!isOpen) return null;

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

  const handleVideoPlay = (item: GalleryItem) => {
    const video = videoRefs.current[item.id];
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const handleDownload = (item: GalleryItem) => {
    onDownloadItem(item);
  };

  const handleDelete = (item: GalleryItem) => {
    if (confirm(`Are you sure you want to delete this ${item.type}?`)) {
      onDeleteItem(item.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/95 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🎨</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Product Gallery
              </h2>
              <p className="text-gray-400 text-sm">
                {galleryItems.length} {galleryItems.length === 1 ? 'item' : 'items'} in your collection
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'grid'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                List
              </button>
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Items</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="type">By Type</option>
            </select>

            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center justify-center text-gray-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-3xl flex items-center justify-center">
                  <span className="text-4xl">📁</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No items yet</h3>
                <p className="text-gray-400 mb-6">
                  Start creating amazing content to see it here!
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all transform hover:scale-105"
                >
                  Start Creating
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-6">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all hover:shadow-xl hover:shadow-purple-500/20"
                    >
                      <div className="relative aspect-video bg-gray-900">
                        {item.type === 'image' ? (
                          <NextImage
                            src={item.src}
                            alt={item.prompt}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <video
                            ref={(el) => (videoRefs.current[item.id] = el)}
                            src={item.src}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            preload="metadata"
                          />
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute inset-0 flex items-center justify-center">
                            {item.type === 'video' && (
                              <button
                                onClick={() => handleVideoPlay(item)}
                                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                              >
                                <Play className="w-6 h-6 text-white ml-1" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all ml-2"
                            >
                              <Eye className="w-6 h-6 text-white" />
                            </button>
                          </div>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-3 left-3">
                          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            item.type === 'image' 
                              ? 'bg-green-500/90 text-white' 
                              : 'bg-blue-500/90 text-white'
                          }`}>
                            {item.type === 'image' ? (
                              <><ImageIcon className="w-3 h-3 inline mr-1" />Image</>
                            ) : (
                              <><Video className="w-3 h-3 inline mr-1" />Video</>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-white text-sm font-medium mb-2 line-clamp-2">
                          {item.prompt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{item.model}</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleDownload(item)}
                            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-all flex items-center justify-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 hover:border-purple-500 transition-all hover:shadow-xl hover:shadow-purple-500/20"
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div className="relative w-20 h-20 bg-gray-900 rounded-xl overflow-hidden flex-shrink-0">
                          {item.type === 'image' ? (
                            <NextImage
                              src={item.src}
                              alt={item.prompt}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <video
                              ref={(el) => (videoRefs.current[item.id] = el)}
                              src={item.src}
                              className="w-full h-full object-cover"
                              muted
                              loop
                              preload="metadata"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                              item.type === 'image' 
                                ? 'bg-green-500/90 text-white' 
                                : 'bg-blue-500/90 text-white'
                            }`}>
                              {item.type === 'image' ? (
                                <><ImageIcon className="w-3 h-3 inline mr-1" />Image</>
                              ) : (
                                <><Video className="w-3 h-3 inline mr-1" />Video</>
                              )}
                            </div>
                            <span className="text-gray-400 text-xs">{item.model}</span>
                          </div>
                          <p className="text-white font-medium mb-1 line-clamp-1">
                            {item.prompt}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.type === 'video' && (
                            <button
                              onClick={() => handleVideoPlay(item)}
                              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center text-gray-300 hover:text-white transition-all"
                            >
                              <Play className="w-4 h-4 ml-0.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center text-gray-300 hover:text-white transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(item)}
                            className="w-10 h-10 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl flex items-center justify-center text-purple-400 hover:text-purple-300 transition-all"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="w-10 h-10 bg-red-500/20 hover:bg-red-500/30 rounded-xl flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for viewing individual items */}
      {selectedItem && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="max-w-4xl max-h-full bg-gray-900 rounded-3xl overflow-hidden border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {selectedItem.prompt}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    {selectedItem.type === 'image' ? (
                      <><ImageIcon className="w-4 h-4" />Image</>
                    ) : (
                      <><Video className="w-4 h-4" />Video</>
                    )}
                  </span>
                  <span>{selectedItem.model}</span>
                  <span>{formatDate(selectedItem.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedItem)}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-xl text-white font-medium transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center text-gray-300 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="relative bg-gray-800 rounded-2xl overflow-hidden">
                {selectedItem.type === 'image' ? (
                  <NextImage
                    src={selectedItem.src}
                    alt={selectedItem.prompt}
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                ) : (
                  <video
                    src={selectedItem.src}
                    controls
                    className="w-full h-auto"
                    autoPlay
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
