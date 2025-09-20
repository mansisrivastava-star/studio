'use client';

import type { Player, LatLngLiteral } from '@/lib/types';
import { useState, useEffect, memo } from 'react';
import {
  APIProvider,
  Map,
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

const PlayerPolygons = memo(({ players }: { players: Player[] }) => {
  const map = useMap();
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clear existing polygons
    polygons.forEach(p => p.setMap(null));
    
    const newPolygons: google.maps.Polygon[] = [];
    players.forEach(player => {
      player.territory.paths.forEach(path => {
        const polygon = new google.maps.Polygon({
          paths: path,
          strokeColor: player.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: player.color,
          fillOpacity: 0.35,
        });
        polygon.setMap(map);
        newPolygons.push(polygon);
      });
    });
    
    setPolygons(newPolygons);

    return () => {
      newPolygons.forEach(p => p.setMap(null));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, players]);

  return null;
});
PlayerPolygons.displayName = 'PlayerPolygons';

const UserPathPolyline = memo(({ path }: { path: LatLngLiteral[] }) => {
  const map = useMap();
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;

    if (!polyline) {
      const newPolyline = new google.maps.Polyline({
        path: path,
        strokeColor: '#4EE2EC',
        strokeOpacity: 1.0,
        strokeWeight: 5,
      });
      newPolyline.setMap(map);
      setPolyline(newPolyline);
    } else {
      polyline.setPath(path);
    }

    return () => {
      // Don't remove the polyline on unmount, let it be managed by the parent component's state
    };
  }, [map, path, polyline]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      polyline?.setMap(null);
    };
  }, [polyline]);

  return null;
});
UserPathPolyline.displayName = 'UserPathPolyline';


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
        <PlayerPolygons players={players} />

        <UserPathPolyline path={userPath} />

        <AdvancedMarker position={currentPosition}>
            <div className="w-4 h-4 rounded-full bg-accent border-2 border-background shadow-lg" />
        </AdvancedMarker>
        
        <GroundOverlay overlayImage={aiOverlay} bounds={mapBounds} />
      </Map>
    </APIProvider>
  );
}
