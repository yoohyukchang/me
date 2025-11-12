'use client';

import { useState } from 'react';
import AlbumsView from '@/components/photos/albums-view/albums-view';
import MapView from '@/components/photos/map-view/map-view';

export default function PhotosPage() {
  const [activeView, setActiveView] = useState<'albums' | 'map'>('albums');

  return (
    <main className="min-h-screen bg-white">
      {/* Header with View Toggle */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Title */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 mt-10">
                Photos
              </h1>
              <p className="text-lg text-gray-600">
                Captured moments from around the world
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveView('albums')}
                className={`
                  px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                  ${activeView === 'albums'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="7" height="7" x="3" y="3" rx="1"/>
                    <rect width="7" height="7" x="14" y="3" rx="1"/>
                    <rect width="7" height="7" x="14" y="14" rx="1"/>
                    <rect width="7" height="7" x="3" y="14" rx="1"/>
                  </svg>
                  <span>Albums</span>
                </div>
              </button>
              <button
                onClick={() => setActiveView('map')}
                className={`
                  px-6 py-2.5 rounded-lg font-medium transition-all duration-200
                  ${activeView === 'map'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>Map</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {activeView === 'albums' ? <AlbumsView /> : <MapView />}
        </div>
      </div>
    </main>
  );
}
