
'use client';

import type { Player, LatLngLiteral } from '@/lib/types';
import { memo } from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl';
import { Skeleton } from '@/components/ui/skeleton';
import 'mapbox-gl/dist/mapbox-gl.css';

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
          Please ensure you have a valid <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in your environment variables.
        </p>
      </div>
    </div>
  );
}

const markerIconStyle: React.CSSProperties = {
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: 'hsl(var(--primary))',
  border: '2px solid white',
  boxShadow: '0 0 10px hsl(var(--primary))',
};

function MapView({ players, currentPosition, userPath, aiOverlay, onMapClick }: MapViewProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) return <MapError />;
  if (!currentPosition) return <Skeleton className="w-full h-full" />;

  const handleMapClick = (e: mapboxgl.MapLayerMouseEvent) => {
    onMapClick(e.lngLat);
  };
  
  const userPathGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: userPath.map(p => [p.lng, p.lat]),
    },
  };

  return (
    <Map
      mapboxAccessToken={mapboxToken}
      initialViewState={{
        longitude: currentPosition.lng,
        latitude: currentPosition.lat,
        zoom: 14,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      onClick={handleMapClick}
    >
      <NavigationControl position="top-right" />
      {players.map(player => 
        player.territory.paths.map((path, index) => {
            const polygonGeoJSON: GeoJSON.Feature<GeoJSON.Polygon> = {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Polygon',
                  coordinates: [path.map(p => [p.lng, p.lat])],
                },
            };
            return (
                <Source key={`${player.id}-${index}`} type="geojson" data={polygonGeoJSON}>
                    <Layer
                        id={`${player.id}-fill-${index}`}
                        type="fill"
                        paint={{
                            'fill-color': player.color,
                            'fill-opacity': 0.35,
                        }}
                    />
                    <Layer
                        id={`${player.id}-stroke-${index}`}
                        type="line"
                        paint={{
                            'line-color': player.color,
                            'line-width': 2,
                        }}
                    />
                </Source>
            )
        })
      )}

      {userPath.length > 1 && (
        <Source id="user-path" type="geojson" data={userPathGeoJSON}>
            <Layer
                id="user-path-line"
                type="line"
                paint={{
                    'line-color': 'hsl(var(--accent))',
                    'line-width': 4,
                    'line-opacity': 1.0,
                }}
            />
        </Source>
      )}
      
      {currentPosition && (
         <Marker longitude={currentPosition.lng} latitude={currentPosition.lat}>
            <div className="w-5 h-5 rounded-full bg-primary border-2 border-white animate-glow" />
          </Marker>
      )}

    </Map>
  );
}

export default memo(MapView);
