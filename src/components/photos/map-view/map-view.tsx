'use client';

import React, { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { albumsData, Album } from '@/data/photos-data/photos-data';
import PhotoLightbox from '@/components/photos/photo-lightbox/photo-lightbox';
import './map-view.css';

interface LocationGroup {
  location: { name: string; coordinates: { lat: number; lng: number } };
  albums: Album[];
}

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function MapView() {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<LocationGroup | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Group albums by location
  const locationGroups: LocationGroup[] = useMemo(() => {
    const groups = new Map<string, LocationGroup>();

    albumsData.forEach(album => {
      if (album.location) {
        const key = `${album.location.coordinates.lat},${album.location.coordinates.lng}`;
        if (!groups.has(key)) {
          groups.set(key, {
            location: album.location,
            albums: []
          });
        }
        groups.get(key)!.albums.push(album);
      }
    });

    return Array.from(groups.values());
  }, []);

  const handleMarkerEnter = (group: LocationGroup, event: React.MouseEvent) => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    setHoveredLocation(group);
    const rect = (event.target as SVGElement).getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  const handleMarkerLeave = () => {
    // Delay hiding to allow user to move mouse to tooltip
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredLocation(null);
      setTooltipPosition(null);
    }, 150);
  };

  const handleTooltipEnter = () => {
    // Clear hide timeout when entering tooltip
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleTooltipLeave = () => {
    // Hide tooltip immediately when leaving it
    setHoveredLocation(null);
    setTooltipPosition(null);
  };

  return (
    <>
      <div className="map-view">
        <div className="map-container-clean">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 160,
              center: [0, 25]
            }}
            className="world-map"
          >
            <ZoomableGroup>
              {/* Countries */}
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#e2e8f0"
                      stroke="#cbd5e1"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: 'none' },
                        hover: {
                          fill: '#cbd5e1',
                          outline: 'none',
                          transition: 'fill 0.3s ease'
                        },
                        pressed: { outline: 'none' }
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* Location Markers */}
              {locationGroups.map((group) => {
                const isHovered = hoveredLocation?.location.name === group.location.name;
                const hasMultipleAlbums = group.albums.length > 1;

                return (
                  <Marker
                    key={group.location.name}
                    coordinates={[group.location.coordinates.lng, group.location.coordinates.lat]}
                  >
                    <g
                      onMouseEnter={(e) => handleMarkerEnter(group, e)}
                      onMouseLeave={handleMarkerLeave}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Marker Circle */}
                      <circle
                        r={isHovered ? 10 : 7}
                        fill={isHovered ? '#000000' : '#3b82f6'}
                        stroke="white"
                        strokeWidth={2.5}
                        className="location-marker-dot"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                          transition: 'all 0.3s ease'
                        }}
                      />

                      {/* Badge for multiple albums */}
                      {hasMultipleAlbums && (
                        <>
                          <circle
                            cx={8}
                            cy={-8}
                            r={6}
                            fill="#ef4444"
                            stroke="white"
                            strokeWidth={1.5}
                          />
                          <text
                            x={8}
                            y={-6}
                            textAnchor="middle"
                            fill="white"
                            fontSize="8"
                            fontWeight="bold"
                          >
                            {group.albums.length}
                          </text>
                        </>
                      )}
                    </g>
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </div>

      {/* Hover Tooltip */}
      {hoveredLocation && tooltipPosition && (
        <div
          className="map-tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 20}px`
          }}
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={handleTooltipLeave}
        >
          <div className="map-tooltip-content">
            <div className="map-tooltip-header">
              <h4>{hoveredLocation.location.name}</h4>
              <span className="map-tooltip-count">
                {hoveredLocation.albums.length === 1
                  ? `${hoveredLocation.albums[0].photoCount} photos`
                  : `${hoveredLocation.albums.length} albums`}
              </span>
            </div>

            <div className="map-tooltip-albums">
              {hoveredLocation.albums.map((album) => (
                <div
                  key={album.id}
                  className="map-tooltip-album"
                  onClick={() => setSelectedAlbum(album)}
                >
                  <div
                    className="map-tooltip-album-thumb"
                    style={{ backgroundImage: `url(${album.coverPhotoUrl})` }}
                  />
                  <div className="map-tooltip-album-info">
                    <h5>{album.title}</h5>
                    <p>{album.photoCount} photos · {album.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedAlbum && (
        <PhotoLightbox
          album={selectedAlbum}
          onClose={() => setSelectedAlbum(null)}
        />
      )}
    </>
  );
}
