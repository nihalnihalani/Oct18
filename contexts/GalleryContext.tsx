/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Gallery state management with IndexedDB persistence
 */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { GalleryItem, GalleryState } from '@/types';
import { MOCK_GALLERY_ITEMS } from '@/lib/mockGalleryItems';

interface GalleryContextType extends GalleryState {
  addItem: (item: Omit<GalleryItem, 'id' | 'createdAt'>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<GalleryItem>) => Promise<void>;
  setSelectedItem: (item: GalleryItem | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  setFilterType: (type: 'all' | 'image' | 'video') => void;
  setSortBy: (sortBy: 'newest' | 'oldest' | 'type') => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  downloadItem: (item: GalleryItem) => void;
  getFilteredItems: () => GalleryItem[];
}

const GalleryContext = createContext<GalleryContextType | null>(null);

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within GalleryProvider');
  }
  return context;
};

interface GalleryProviderProps {
  children: ReactNode;
}

// IndexedDB helper functions
const DB_NAME = 'veo-gallery-db';
const DB_VERSION = 1;
const ITEMS_STORE = 'gallery-items';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(ITEMS_STORE)) {
        const store = db.createObjectStore(ITEMS_STORE, { keyPath: 'id' });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

const saveItemToDB = async (item: GalleryItem): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ITEMS_STORE], 'readwrite');
    const store = transaction.objectStore(ITEMS_STORE);
    const request = store.put(item);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const deleteItemFromDB = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([ITEMS_STORE], 'readwrite');
    const store = transaction.objectStore(ITEMS_STORE);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const loadItemsFromDB = async (): Promise<GalleryItem[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ITEMS_STORE], 'readonly');
      const store = transaction.objectStore(ITEMS_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const items = request.result.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }));
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to load from IndexedDB:', error);
    return [];
  }
};

export const GalleryProvider: React.FC<GalleryProviderProps> = ({ children }) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'type'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load items from IndexedDB on mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        const savedItems = await loadItemsFromDB();
        
        if (savedItems.length === 0) {
          // Initialize with mock data
          const mockItems = MOCK_GALLERY_ITEMS.map(item => ({
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          }));
          setItems(mockItems);
          
          // Save mock items to DB (non-blocking)
          for (const item of mockItems) {
            await saveItemToDB(item).catch(err => {
              console.warn('Failed to save mock item to IndexedDB:', err);
            });
          }
        } else {
          setItems(savedItems);
        }
      } catch (error) {
        console.error('Failed to load gallery from IndexedDB:', error);
        // Initialize with mock data as fallback
        const mockItems = MOCK_GALLERY_ITEMS.map(item => ({
          ...item,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        }));
        setItems(mockItems);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadItems();
  }, []);

  const addItem = useCallback(async (itemData: Omit<GalleryItem, 'id' | 'createdAt'>) => {
    const newItem: GalleryItem = {
      ...itemData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    
    setItems(prev => [newItem, ...prev]);
    await saveItemToDB(newItem).catch(console.error);
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    await deleteItemFromDB(id).catch(console.error);
  }, []);

  const updateItem = useCallback(async (id: string, updates: Partial<GalleryItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
    
    const updatedItem = items.find(item => item.id === id);
    if (updatedItem) {
      await saveItemToDB({ ...updatedItem, ...updates }).catch(console.error);
    }
  }, [items]);

  const downloadItem = useCallback((item: GalleryItem) => {
    const link = document.createElement('a');
    link.href = item.src;
    link.download = `veo3_${item.type}_${item.id}.${item.type === 'image' ? 'png' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const getFilteredItems = useCallback(() => {
    let filtered = items.filter(item => 
      filterType === 'all' || item.type === filterType
    );
    
    filtered.sort((a, b) => {
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
    
    return filtered;
  }, [items, filterType, sortBy]);

  const value: GalleryContextType = {
    items,
    selectedItem,
    isOpen,
    filterType,
    sortBy,
    viewMode,
    addItem,
    deleteItem,
    updateItem,
    setSelectedItem,
    setIsOpen,
    setFilterType,
    setSortBy,
    setViewMode,
    downloadItem,
    getFilteredItems,
  };

  // Always render - show loading state if needed
  if (!isLoaded) {
    return (
      <GalleryContext.Provider value={value}>
        {children}
      </GalleryContext.Provider>
    );
  }

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
};

