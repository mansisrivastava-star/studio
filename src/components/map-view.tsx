'use client';

import type { Player, LatLngLiteral } from '@/lib/types';
import { useState, useEffect, memo } from 'react';
import {
  APIProvider,
  Map,
  Polygon,
  Polyline,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { Skeleton } from '@/components/ui/skeleton';

interface MapViewProps {
  players: Player[];
  currentPosition: LatLngLiteral | null;
  userPath: LatLngLiteral[];
  aiOverlay: string | null;
}

const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || 'c19e59297b229d46';
const initialCenter = { lat: 37.7749, lng: -122.4194 };

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

const MemoizedPolygon = memo(Polygon);

function GroundOverlay({
  overlayImage,
  bounds,
}: {
  overlayImage: string | null;
  bounds: google.maps.LatLngBoundsLiteral;
}) {
  const map = useMap();
  const [overlay, setOverlay] = useState<google.maps.GroundOverlay | null>(null);

  useEffect(() => {
    if (!map) return;
    
    if (overlay) {
        overlay.setMap(null);
    }

    if (overlayImage) {
        const newOverlay = new google.maps.GroundOverlay(overlayImage, bounds, {
          opacity: 0.75,
        });
        newOverlay.setMap(map);
        setOverlay(newOverlay);
    }

    return () => {
      if (overlay) {
        overlay.setMap(null);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, overlayImage, bounds]);

  return null;
}


export default function MapView({ players, currentPosition, userPath, aiOverlay }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <MapError />;
  }

  if (!currentPosition) {
    return <Skeleton className="w-full h-full" />;
  }
  
  const mapBounds: google.maps.LatLngBoundsLiteral = {
    north: currentPosition.lat + 0.05,
    south: currentPosition.lat - 0.05,
    east: currentPosition.lng + 0.05,
    west: currentPosition.lng - 0.05,
  };


  return (
    <APIProvider apiKey={apiKey} libraries={['maps']}>
      <Map
        defaultCenter={initialCenter}
        center={currentPosition}
        defaultZoom={15}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId={mapId}
        className="w-full h-full"
      >
        {players.map((player) =>
          player.territory.paths.map((path, index) => (
            <MemoizedPolygon
              key={`${player.id}-${index}`}
              paths={path}
              strokeColor={player.color}
              strokeOpacity={0.8}
              strokeWeight={2}
              fillColor={player.color}
              fillOpacity={0.35}
            />
          ))
        )}

        {userPath.length > 1 && (
          <Polyline path={userPath} strokeColor="#4EE2EC" strokeWeight={5} />
        )}

        <AdvancedMarker position={currentPosition}>
            <div className="w-4 h-4 rounded-full bg-accent border-2 border-background shadow-lg" />
        </AdvancedMarker>
        
        <GroundOverlay overlayImage={aiOverlay} bounds={mapBounds} />
      </Map>
    </APIProvider>
  );
}
