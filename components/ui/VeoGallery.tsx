"use client";

import React, { useState, useRef } from "react";
import { X, Play, Pause, Download, Trash2, Eye, Calendar, Clock, Image as ImageIcon, Video, Edit } from "lucide-react";
import NextImage from "next/image";
import EditVideoPage from "./EditVideoPage";

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  prompt: string;
  model: string;
  createdAt: Date;
  thumbnail?: string;
}

interface VeoGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  galleryItems: GalleryItem[];
  onDeleteItem: (id: string) => void;
  onDownloadItem: (item: GalleryItem) => void;
  onEditItem: (item: GalleryItem) => void;
}

// Custom icons from veo-3-gallery
const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}>
    <path
      fillRule="evenodd"
      d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653Z"
      clipRule="evenodd"
    />
  </svg>
);

const VideoCameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9a2.25 2.25 0 0 0-2.25 2.25v9A2.25 2.25 0 0 0 4.5 18.75Z"
    />
  </svg>
);

const VeoGallery: React.FC<VeoGalleryProps> = ({
  isOpen,
  onClose,
  galleryItems,
  onDeleteItem,
  onDownloadItem,
  onEditItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
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

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setSelectedItem(null); // Close modal if open
  };

  const handleSaveEdit = (updatedVideo: GalleryItem) => {
    onEditItem(updatedVideo);
    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header - Inspired by veo-3-gallery */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/95 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <VideoCameraIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Veo Gallery
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
                  <VideoCameraIcon className="w-12 h-12 text-gray-400" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="group w-full text-left bg-gray-800/50 rounded-lg overflow-hidden shadow-lg hover:shadow-gray-500/30 transform transition-all duration-300 hover:-translate-y-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="relative">
                        {item.type === 'image' ? (
                          <NextImage
                            src={item.src}
                            alt={item.prompt}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover pointer-events-none"
                          />
                        ) : (
                          <video
                            ref={(el) => (videoRefs.current[item.id] = el)}
                            src={item.src}
                            className="w-full h-48 object-cover pointer-events-none"
                            muted
                            playsInline
                            preload="metadata"
                            aria-hidden="true"
                          />
                        )}
                        
                        {/* Play overlay for videos */}
                        {item.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <PlayIcon className="w-16 h-16 text-white opacity-80 drop-shadow-lg group-hover:opacity-100 transform group-hover:scale-110 transition-transform" />
                          </div>
                        )}

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

                        {/* Action buttons overlay */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-2">
                            {item.type === 'video' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(item);
                                }}
                                className="w-8 h-8 bg-purple-500/80 hover:bg-purple-600/80 rounded-full flex items-center justify-center text-white transition-all"
                                title="Edit Video"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item);
                              }}
                              className="w-8 h-8 bg-gray-700/80 hover:bg-gray-600/80 rounded-full flex items-center justify-center text-white transition-all"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item);
                              }}
                              className="w-8 h-8 bg-red-500/80 hover:bg-red-600/80 rounded-full flex items-center justify-center text-white transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-base font-semibold text-gray-200 truncate mb-2" title={item.prompt}>
                          {item.prompt}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{item.model}</span>
                          <span>{formatDate(item.createdAt)}</span>
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
                          {item.type === 'video' && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="w-10 h-10 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl flex items-center justify-center text-purple-400 hover:text-purple-300 transition-all"
                              title="Edit Video"
                            >
                              <Edit className="w-4 h-4" />
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

      {/* Modal for viewing individual items - Inspired by veo-3-gallery VideoPlayer */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center animate-fade-in">
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex-shrink-0 p-2 sm:p-4">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-2 right-2 text-white/70 hover:text-white z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
                aria-label="Close video player"
              >
                <X className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
              <div className="aspect-w-16 aspect-h-9 bg-black rounded-md overflow-hidden">
                {selectedItem.type === 'image' ? (
                  <NextImage
                    src={selectedItem.src}
                    alt={selectedItem.prompt}
                    width={800}
                    height={600}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    key={selectedItem.id}
                    className="w-full h-full"
                    src={selectedItem.src}
                    controls
                    autoPlay
                    loop
                    aria-label={selectedItem.prompt}
                  />
                )}
              </div>
            </div>
            <div className="flex-1 p-4 pt-2 overflow-y-auto">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {selectedItem.prompt}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
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
                  {selectedItem.type === 'video' && (
                    <button
                      onClick={() => handleEdit(selectedItem)}
                      className="flex-shrink-0 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
                      aria-label="Edit video"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(selectedItem)}
                    className="flex-shrink-0 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm"
                    aria-label="Download item"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Video Page */}
      {editingItem && (
        <EditVideoPage
          video={editingItem}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

export default VeoGallery;
