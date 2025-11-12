import { Album } from '@/data/photos-data/photos-data';
import './album-card.css';

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
}

export default function AlbumCard({ album, onClick }: AlbumCardProps) {
  return (
    <div className="album-card" onClick={onClick}>
      {/* Cover Image */}
      <div
        className="album-card-image"
        style={{
          backgroundImage: `url(${album.coverPhotoUrl})`
        }}
      >
        <div className="album-card-overlay">
          <div className="album-card-count">
            {album.photoCount} photos
          </div>
        </div>
      </div>

      {/* Album Info */}
      <div className="album-card-content">
        <h3 className="album-card-title">{album.title}</h3>

        <div className="album-card-meta">
          {album.location && (
            <div className="album-card-location">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{album.location.name}</span>
            </div>
          )}
          <div className="album-card-date">{album.date}</div>
        </div>

        {album.description && (
          <p className="album-card-description">{album.description}</p>
        )}
      </div>
    </div>
  );
}
