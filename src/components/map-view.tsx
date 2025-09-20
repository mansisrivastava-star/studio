
'use client';

import type { Player, LatLngLiteral } from '@/lib/types';
import { memo } from 'react';
import { GoogleMap, useLoadScript, Polygon, Polyline, AdvancedMarker } from '@react-google-maps/api';
import { Skeleton } from '@/components/ui/skeleton';

interface MapViewProps {
  players: Player[];
  currentPosition: LatLngLiteral | null;
  userPath: LatLngLiteral[];
  aiOverlay: string | null;
  onMapClick: (coords: LatLngLiteral) => void;
}

function MapError() {
  return (
    <div className="w-full h-full bg-destructive/20 flex items-center justify-center">
      <div className="bg-background p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-headline text-destructive mb-2">Map Error</h2>
        <p className="text-destructive-foreground">
          Could not load the map.
          <br />
          Please ensure you have a valid <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in your environment variables.
        </p>
      </div>
    </div>
  );
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    clickableIcons: false,
    styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ]
};

function MapView({ players, currentPosition, userPath, aiOverlay, onMapClick }: MapViewProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  if (loadError) return <MapError />;
  if (!isLoaded || !currentPosition) return <Skeleton className="w-full h-full" />;

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    }
  };

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={currentPosition}
      zoom={14}
      options={mapOptions}
      onClick={handleMapClick}
    >
      {players.map(player => 
        player.territory.paths.map((path, index) => (
          <Polygon
            key={`${player.id}-${index}`}
            paths={path}
            options={{
              fillColor: player.color,
              strokeColor: player.color,
              fillOpacity: 0.35,
              strokeWeight: 2,
            }}
          />
        ))
      )}

      {userPath.length > 1 && (
        <Polyline
            path={userPath}
            options={{
                strokeColor: 'hsl(var(--accent))',
                strokeOpacity: 1.0,
                strokeWeight: 4,
            }}
        />
      )}
      
      <AdvancedMarker position={currentPosition}>
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-background shadow-lg animate-pulse" />
      </AdvancedMarker>

      {/* AI Overlay is more complex with Google Maps, typically done with GroundOverlay.
          This implementation is simplified and may need adjustment based on how the overlay is generated. */}
      {/* {aiOverlay && <GroundOverlay url={aiOverlay} bounds={mapBounds} />} */}

    </GoogleMap>
  );
}

export default memo(MapView);
