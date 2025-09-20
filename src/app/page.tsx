
'use client';

import type { Player, LatLngLiteral } from '@/lib/types';
import { useState } from 'react';
import { mockPlayers } from '@/lib/mock-data';
import MapView from '@/components/map-view';
import Scoreboard from '@/components/scoreboard';
import PlayerControls from '@/components/player-controls';
import { TurfWarIcon } from '@/components/icons';
import LocationInput from '@/components/location-input';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>(mockPlayers);
  const [currentUser, setCurrentUser] = useState<Player>(players[0]);
  const [currentPosition, setCurrentPosition] = useState<LatLngLiteral | null>(null);
  const [path, setPath] = useState<LatLngLiteral[]>([]);
  const [aiOverlay, setAiOverlay] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [isLocationSet, setIsLocationSet] = useState(false);

  const handleLocationSet = (name: string, coords: LatLngLiteral) => {
    setLocation(name);
    setCurrentPosition(coords);
    setPath([coords]); // Start path at the selected location
    setIsLocationSet(true);
  };

  const handleColorChange = (color: string) => {
    const updatedUser = { ...currentUser, color };
    setCurrentUser(updatedUser);
    
    setPlayers(prevPlayers =>
      prevPlayers.map(p => (p.id === currentUser.id ? updatedUser : p))
    );
  };
  
  const handleMapClick = (coords: LatLngLiteral) => {
    if (!isLocationSet) return;
    setPath(prevPath => [...prevPath, coords]);
  };

  const handleClaimTerritory = () => {
    if (path.length < 3) {
      toast({
        variant: 'destructive',
        title: 'Invalid Path',
        description: 'You need at least 3 points to claim a territory.',
      });
      return;
    }

    // A simple calculation for score based on area (highly simplified)
    const newScore = Math.floor(Math.random() * 200) + 50;

    const updatedPlayers = players.map(p => {
      if (p.id === currentUser.id) {
        return {
          ...p,
          score: p.score + newScore,
          territory: {
            ...p.territory,
            paths: [...p.territory.paths, path],
          },
        };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    
    // Reset path for the next territory claim
    if(currentPosition) {
        setPath([currentPosition]);
    } else {
        setPath([]);
    }

    toast({
      title: 'Territory Claimed!',
      description: `You've expanded your turf and gained ${newScore} score.`,
    });
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <MapView
        players={players}
        currentPosition={currentPosition}
        userPath={path}
        aiOverlay={aiOverlay}
        onMapClick={handleMapClick}
      />
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto bg-card/80 backdrop-blur-sm p-3 rounded-lg">
          <TurfWarIcon className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-headline font-bold text-foreground">
              Turf Wars
            </h1>
            {location && <p className="text-sm text-muted-foreground">{location}</p>}
          </div>
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
          onClaimTerritory={handleClaimTerritory}
          canClaimTerritory={path.length >= 3}
        />
      </div>

      {!isLocationSet && <LocationInput onLocationSet={handleLocationSet} isOpen={!isLocationSet} />}
    </main>
  );
}
