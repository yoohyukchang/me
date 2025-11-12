export interface Photo {
  id: string;
  albumId: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  takenDate: string;
  location?: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  description?: string;
}

export interface Album {
  id: string;
  title: string;
  coverPhotoUrl: string;
  photoCount: number;
  location?: {
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  date: string;
  description?: string;
}

export const albumsData: Album[] = [
  {
    id: "baltimore-winter-2025",
    title: "Baltimore Winter",
    coverPhotoUrl: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&h=600&fit=crop",
    photoCount: 24,
    location: {
      name: "Baltimore, MD",
      coordinates: { lat: 39.2904, lng: -76.6122 }
    },
    date: "January 2025",
    description: "Winter scenes around Baltimore"
  },
  {
    id: "korea-summer-2024",
    title: "Korea Summer",
    coverPhotoUrl: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800&h=600&fit=crop",
    photoCount: 156,
    location: {
      name: "Seoul, South Korea",
      coordinates: { lat: 37.5665, lng: 126.9780 }
    },
    date: "July 2024",
    description: "Summer trip to Korea"
  },
  {
    id: "nyc-fall-2024",
    title: "NYC Fall",
    coverPhotoUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop",
    photoCount: 89,
    location: {
      name: "New York City, NY",
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    date: "October 2024",
    description: "Fall colors in Central Park"
  },
  {
    id: "san-francisco-2024",
    title: "San Francisco",
    coverPhotoUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop",
    photoCount: 67,
    location: {
      name: "San Francisco, CA",
      coordinates: { lat: 37.7749, lng: -122.4194 }
    },
    date: "September 2024",
    description: "Golden Gate and city views"
  },
  {
    id: "paris-spring-2024",
    title: "Paris Spring",
    coverPhotoUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop",
    photoCount: 142,
    location: {
      name: "Paris, France",
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    date: "April 2024",
    description: "Spring in the City of Light"
  },
  {
    id: "tokyo-winter-2023",
    title: "Tokyo Winter",
    coverPhotoUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop",
    photoCount: 198,
    location: {
      name: "Tokyo, Japan",
      coordinates: { lat: 35.6762, lng: 139.6503 }
    },
    date: "December 2023",
    description: "Winter lights and city life"
  },
  {
    id: "baltimore-harbor-2024",
    title: "Inner Harbor",
    coverPhotoUrl: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=800&h=600&fit=crop",
    photoCount: 45,
    location: {
      name: "Baltimore, MD",
      coordinates: { lat: 39.2904, lng: -76.6122 }
    },
    date: "August 2024",
    description: "Inner Harbor sunset"
  },
  {
    id: "london-2023",
    title: "London Adventures",
    coverPhotoUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop",
    photoCount: 112,
    location: {
      name: "London, UK",
      coordinates: { lat: 51.5074, lng: -0.1278 }
    },
    date: "November 2023",
    description: "Exploring historic London"
  },
  {
    id: "sydney-2023",
    title: "Sydney Summer",
    coverPhotoUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop",
    photoCount: 88,
    location: {
      name: "Sydney, Australia",
      coordinates: { lat: -33.8688, lng: 151.2093 }
    },
    date: "January 2023",
    description: "Opera House and beaches"
  },
  {
    id: "iceland-2023",
    title: "Iceland Road Trip",
    coverPhotoUrl: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&h=600&fit=crop",
    photoCount: 234,
    location: {
      name: "Reykjavik, Iceland",
      coordinates: { lat: 64.1466, lng: -21.9426 }
    },
    date: "September 2023",
    description: "Northern lights and waterfalls"
  }
];

// Generate sample photos for albums
export const photosData: Photo[] = [
  // Baltimore Winter 2025
  ...Array.from({ length: 24 }, (_, i) => ({
    id: `baltimore-winter-${i}`,
    albumId: "baltimore-winter-2025",
    url: `https://images.unsplash.com/photo-${1485871981521 + i}?w=1200&h=${800 + (i % 3) * 200}&fit=crop`,
    thumbnailUrl: `https://images.unsplash.com/photo-${1485871981521 + i}?w=400&h=${300 + (i % 3) * 100}&fit=crop`,
    width: 1200,
    height: 800 + (i % 3) * 200,
    takenDate: `2025-01-${String(i + 1).padStart(2, '0')}`,
    location: {
      name: "Baltimore, MD",
      coordinates: { lat: 39.2904, lng: -76.6122 }
    }
  })),
  // Korea Summer 2024
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `korea-summer-${i}`,
    albumId: "korea-summer-2024",
    url: `https://images.unsplash.com/photo-${1517154421773 + i}?w=${1200 + (i % 2) * 200}&h=900&fit=crop`,
    thumbnailUrl: `https://images.unsplash.com/photo-${1517154421773 + i}?w=400&h=300&fit=crop`,
    width: 1200 + (i % 2) * 200,
    height: 900,
    takenDate: `2024-07-${String((i % 30) + 1).padStart(2, '0')}`,
    location: {
      name: "Seoul, South Korea",
      coordinates: { lat: 37.5665, lng: 126.9780 }
    }
  })),
  // NYC Fall 2024
  ...Array.from({ length: 28 }, (_, i) => ({
    id: `nyc-fall-${i}`,
    albumId: "nyc-fall-2024",
    url: `https://images.unsplash.com/photo-${1496442226666 + i}?w=1000&h=${1200 + (i % 4) * 150}&fit=crop`,
    thumbnailUrl: `https://images.unsplash.com/photo-${1496442226666 + i}?w=400&h=500&fit=crop`,
    width: 1000,
    height: 1200 + (i % 4) * 150,
    takenDate: `2024-10-${String((i % 28) + 1).padStart(2, '0')}`,
    location: {
      name: "New York City, NY",
      coordinates: { lat: 40.7128, lng: -74.0060 }
    }
  }))
];

// Helper function to get albums by location (for map view)
export function getAlbumsByLocation(): Map<string, Album[]> {
  const locationMap = new Map<string, Album[]>();

  albumsData.forEach(album => {
    if (album.location) {
      const key = `${album.location.coordinates.lat},${album.location.coordinates.lng}`;
      const existing = locationMap.get(key) || [];
      locationMap.set(key, [...existing, album]);
    }
  });

  return locationMap;
}

// Helper function to get photos by album
export function getPhotosByAlbum(albumId: string): Photo[] {
  return photosData.filter(photo => photo.albumId === albumId);
}
