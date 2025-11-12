'use client';

import { useState } from 'react';
import { albumsData, Album } from '@/data/photos-data/photos-data';
import AlbumCard from '@/components/photos/album-card/album-card';
import PhotoLightbox from '@/components/photos/photo-lightbox/photo-lightbox';
import './albums-view.css';

export default function AlbumsView() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  return (
    <>
      <div className="albums-grid">
        {albumsData.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            onClick={() => setSelectedAlbum(album)}
          />
        ))}
      </div>

      {/* Lightbox for viewing album */}
      {selectedAlbum && (
        <PhotoLightbox
          album={selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
        />
      )}
    </>
  );
}
