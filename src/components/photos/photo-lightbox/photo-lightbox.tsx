'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Album, getPhotosByAlbum } from '@/data/photos-data/photos-data';
import { computeJustifiedLayout } from '@/lib/justified-layout';
import './photo-lightbox.css';

interface PhotoLightboxProps {
  album: Album;
  onClose: () => void;
}

export default function PhotoLightbox({ album, onClose }: PhotoLightboxProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [layout, setLayout] = useState<ReturnType<typeof computeJustifiedLayout> | null>(null);

  // Memoize photos to prevent infinite loop
  const photos = useMemo(() => getPhotosByAlbum(album.id), [album.id]);

  // Handle container resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Compute layout when width changes
  useEffect(() => {
    if (photos.length > 0 && containerWidth > 0) {
      const computedLayout = computeJustifiedLayout(photos, containerWidth, 280, 4);
      setLayout(computedLayout);
    }
  }, [photos, containerWidth]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPhotoIndex !== null) {
          setSelectedPhotoIndex(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedPhotoIndex, onClose]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handlePrevious = useCallback(() => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  }, [selectedPhotoIndex]);

  const handleNext = useCallback(() => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  }, [selectedPhotoIndex, photos.length]);

  // Arrow key navigation
  useEffect(() => {
    if (selectedPhotoIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, handlePrevious, handleNext]);

  return (
    <div className="photo-lightbox">
      {/* Header */}
      <div className="photo-lightbox-header">
        <div className="photo-lightbox-header-content">
          <div>
            <h2 className="photo-lightbox-title">{album.title}</h2>
            <p className="photo-lightbox-subtitle">
              {album.photoCount} photos · {album.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="photo-lightbox-close"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"/>
              <path d="m6 6 12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="photo-lightbox-content">
        <div
          ref={containerRef}
          className="photo-grid-container"
          style={{
            height: layout ? `${layout.containerHeight}px` : 'auto',
            position: 'relative'
          }}
        >
          {layout &&
            layout.boxes.map((box, index) => {
              const photo = photos[index];
              return (
                <div
                  key={photo.id}
                  className="photo-grid-item"
                  style={{
                    position: 'absolute',
                    left: `${box.x}px`,
                    top: `${box.y}px`,
                    width: `${box.width}px`,
                    height: `${box.height}px`
                  }}
                  onClick={() => setSelectedPhotoIndex(index)}
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt={`Photo ${index + 1}`}
                    className="photo-grid-image"
                    loading="lazy"
                  />
                </div>
              );
            })}
        </div>
      </div>

      {/* Full-size Photo Viewer */}
      {selectedPhotoIndex !== null && (
        <div className="photo-viewer" onClick={() => setSelectedPhotoIndex(null)}>
          <div className="photo-viewer-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[selectedPhotoIndex].url}
              alt={`Photo ${selectedPhotoIndex + 1}`}
              className="photo-viewer-image"
            />

            {/* Navigation */}
            {selectedPhotoIndex > 0 && (
              <button
                className="photo-viewer-nav photo-viewer-nav-prev"
                onClick={handlePrevious}
                aria-label="Previous photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
            )}

            {selectedPhotoIndex < photos.length - 1 && (
              <button
                className="photo-viewer-nav photo-viewer-nav-next"
                onClick={handleNext}
                aria-label="Next photo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            )}

            {/* Photo Counter */}
            <div className="photo-viewer-counter">
              {selectedPhotoIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
