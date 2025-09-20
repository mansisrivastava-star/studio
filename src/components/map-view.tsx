
'use client';

import type { Player, LatLngLiteral } from '@/lib/types';
import { memo, useState, useCallback, useEffect } from 'react';
import Map, { Source, Layer, Marker, NavigationControl, Popup } from 'react-map-gl';
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

function MapView({ players, currentPosition, userPath, aiOverlay, onMapClick }: MapViewProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const [accentColor, setAccentColor] = useState('#4EE2EC');
  const [hoverInfo, setHoverInfo] = useState<{ lng: number, lat: number, playerName: string } | null>(null);

  useEffect(() => {
    // In a real app, you might fetch this from a CSS variable, but for now, we'll hardcode it to avoid HSL issues with mapbox
    // const color = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    setAccentColor('#4EE2EC'); // This is the hex value for hsl(183 82% 61%)
  }, []);
  
  const handleMapClick = (e: mapboxgl.MapLayerMouseEvent) => {
    onMapClick(e.lngLat);
  };
  
  const onMouseMove = useCallback((event: mapboxgl.MapLayerMouseEvent) => {
    const { features, lngLat } = event;
    const hoveredFeature = features && features[0];
    
    if (hoveredFeature && hoveredFeature.layer) {
      const mapElement = document.getElementById('mapbox-map');
      if (mapElement) {
        mapElement.style.cursor = 'pointer';
      }
      const layerId = hoveredFeature.layer.id;
      const playerId = layerId.split('-')[0];
      const player = players.find(p => p.id === playerId);
      if (player) {
        setHoverInfo({
          lng: lngLat.lng,
          lat: lngLat.lat,
          playerName: player.name,
        });
      }
    } else {
      const mapElement = document.getElementById('mapbox-map');
      if (mapElement) {
        mapElement.style.cursor = '';
      }
      setHoverInfo(null);
    }
  }, [players]);

  if (!mapboxToken) return <MapError />;
  if (!currentPosition) return <Skeleton className="w-full h-full" />;

  const userPathGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: userPath.map(p => [p.lng, p.lat]),
    },
  };

  const interactiveLayerIds = players.flatMap(player => 
    player.territory.paths.map((_, index) => `${player.id}-fill-${index}`)
  );

  return (
    <Map
      id="mapbox-map"
      mapboxAccessToken={mapboxToken}
      key={currentPosition.lat + '_' + currentPosition.lng}
      initialViewState={{
        longitude: currentPosition.lng,
        latitude: currentPosition.lat,
        zoom: 14,
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      onClick={handleMapClick}
      onMouseMove={onMouseMove}
      interactiveLayerIds={interactiveLayerIds}
    >
      <NavigationControl position="top-right" />
      {players.map(player => 
        player.territory.paths.map((path, index) => {
            if (path.length < 3) return null; // A polygon needs at least 3 points
            const polygonGeoJSON: GeoJSON.Feature<GeoJSON.Polygon> = {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Polygon',
                  coordinates: [[...path, path[0]].map(p => [p.lng, p.lat])], // Close the polygon
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
                    'line-color': accentColor,
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

      {hoverInfo && (
        <Popup
          longitude={hoverInfo.lng}
          latitude={hoverInfo.lat}
          closeButton={false}
          closeOnClick={false}
          anchor="top"
          offset={10}
          className="bg-card/80 backdrop-blur-sm !rounded-md !shadow-lg"
        >
           <div className="!bg-transparent !p-2 !text-card-foreground font-semibold text-sm">{hoverInfo.playerName}</div>
        </Popup>
      )}
    </Map>
  );
}

export default memo(MapView);
