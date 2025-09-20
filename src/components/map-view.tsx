'use client';

import type { Player, LatLngLiteral } from '@/lib/types';
import { useState, useEffect } from 'react';
import Map, { Source, Layer, Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Skeleton } from '@/components/ui/skeleton';

interface MapViewProps {
  players: Player[];
  currentPosition: LatLngLiteral | null;
  userPath: LatLngLiteral[];
  aiOverlay: string | null;
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

// Convert player territory to GeoJSON
const toGeoJSON = (players: Player[]): GeoJSON.FeatureCollection => {
  const features: GeoJSON.Feature[] = players.flatMap((player) =>
    player.territory.paths.map((path) => ({
      type: 'Feature',
      properties: {
        color: player.color,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [path.map((p) => [p.lng, p.lat])],
      },
    }))
  );
  return {
    type: 'FeatureCollection',
    features,
  };
};

// Convert user path to GeoJSON
const toPathGeoJSON = (path: LatLngLiteral[]): GeoJSON.Feature => {
    return {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'LineString',
            coordinates: path.map(p => [p.lng, p.lat]),
        },
    };
};

export default function MapView({ players, currentPosition, userPath, aiOverlay }: MapViewProps) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const [territoryGeoJSON, setTerritoryGeoJSON] = useState<GeoJSON.FeatureCollection | null>(null);
  const [pathGeoJSON, setPathGeoJSON] = useState<GeoJSON.Feature | null>(null);

  useEffect(() => {
    setTerritoryGeoJSON(toGeoJSON(players));
  }, [players]);

  useEffect(() => {
    setPathGeoJSON(toPathGeoJSON(userPath));
  }, [userPath]);

  if (!accessToken) {
    return <MapError />;
  }

  if (!currentPosition) {
    return <Skeleton className="w-full h-full" />;
  }

  const mapBounds: [number, number, number, number] = [
    currentPosition.lng - 0.05, // west
    currentPosition.lat - 0.05, // south
    currentPosition.lng + 0.05, // east
    currentPosition.lat + 0.05, // north
  ];

  return (
    <Map
      mapboxAccessToken={accessToken}
      initialViewState={{
        longitude: currentPosition.lng,
        latitude: currentPosition.lat,
        zoom: 14,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
    >
      {territoryGeoJSON && (
        <Source id="territories" type="geojson" data={territoryGeoJSON}>
          <Layer
            id="territory-fill"
            type="fill"
            paint={{
              'fill-color': ['get', 'color'],
              'fill-opacity': 0.35,
            }}
          />
          <Layer
            id="territory-stroke"
            type="line"
            paint={{
              'line-color': ['get', 'color'],
              'line-width': 2,
            }}
          />
        </Source>
      )}

      {pathGeoJSON && (
         <Source id="user-path" type="geojson" data={pathGeoJSON}>
            <Layer
                id="user-path-line"
                type="line"
                paint={{
                    'line-color': '#4EE2EC',
                    'line-width': 5,
                }}
            />
        </Source>
      )}

      <Marker longitude={currentPosition.lng} latitude={currentPosition.lat}>
        <div className="w-4 h-4 rounded-full bg-accent border-2 border-background shadow-lg" />
      </Marker>

      {aiOverlay && (
         <Source id="ai-overlay" type="image" url={aiOverlay} coordinates={[
            [mapBounds[0], mapBounds[3]], // NW
            [mapBounds[2], mapBounds[3]], // NE
            [mapBounds[2], mapBounds[1]], // SE
            [mapBounds[0], mapBounds[1]], // SW
         ]}>
            <Layer
                id="ai-overlay-layer"
                type="raster"
                paint={{'raster-opacity': 0.75}}
            />
        </Source>
      )}
    </Map>
  );
}
