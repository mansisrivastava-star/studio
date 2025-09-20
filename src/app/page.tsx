'use client';

import type { Player, LatLngLiteral } from '@/lib/types';
import { useState, useEffect } from 'react';
import { mockPlayers } from '@/lib/mock-data';
import MapView from '@/components/map-view';
import Scoreboard from '@/components/scoreboard';
import PlayerControls from '@/components/player-controls';
import { TurfWarIcon } from '@/components/icons';

export default function Home() {
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [currentUser, setCurrentUser] = useState<Player>(players[0]);
  const [currentPosition, setCurrentPosition] = useState<LatLngLiteral | null>(null);
  const [path, setPath] = useState<LatLngLiteral[]>([]);
  const [aiOverlay, setAiOverlay] = useState<string | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = { lat: latitude, lng: longitude };
          setCurrentPosition(newPosition);
          setPath((prevPath) => [...prevPath, newPosition]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to a default location if geolocation fails
          if (!currentPosition) {
            setCurrentPosition({ lat: 37.7749, lng: -122.4194 }); // San Francisco
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
        // Fallback for browsers that don't support geolocation
        if (!currentPosition) {
            setCurrentPosition({ lat: 37.7749, lng: -122.4194 }); // San Francisco
        }
    }
  }, [currentPosition]);

  const handleColorChange = (color: string) => {
    setCurrentUser((prev) => ({ ...prev, color }));
    setPlayers((prevPlayers) =>
      prevPlayers.map((p) => (p.id === currentUser.id ? { ...p, color } : p))
    );
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <MapView
        players={players}
        currentPosition={currentPosition}
        userPath={path}
        aiOverlay={aiOverlay}
      />
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto bg-card/80 backdrop-blur-sm p-3 rounded-lg">
          <TurfWarIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-foreground">
            Turf Wars
          </h1>
        </div>
        <div className="pointer-events-auto">
          <Scoreboard players={players} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 p-4 md:p-6 pointer-events-auto">
        <PlayerControls
          currentUser={currentUser}
          onColorChange={handleColorChange}
          onPrediction={setAiOverlay}
        />
      </div>
    </main>
  );
}
