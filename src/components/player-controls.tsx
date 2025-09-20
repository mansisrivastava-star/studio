
'use client';

import type { Player } from '@/lib/types';
import { useState } from 'react';
import { predictHighTrafficRoutes } from '@/ai/flows/predict-high-traffic-routes';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BrainCircuit, Loader, Palette, Pin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface PlayerControlsProps {
  currentUser: Player;
  onColorChange: (color: string) => void;
  onPrediction: (overlay: string | null) => void;
  onClaimTerritory: () => void;
  canClaimTerritory: boolean;
}

const availableColors = [
  '#FF5733', // Red-Orange
  '#33FF57', // Green
  '#3357FF', // Blue
  '#FF33A1', // Pink
  '#F3FF33', // Yellow
];

// Placeholder data for the AI flow
const placeholderMapData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
const placeholderMovementData = JSON.stringify({
  "user_1": [{ "lat": 37.77, "lng": -122.41, "timestamp": "2023-10-27T10:00:00Z" }],
  "user_2": [{ "lat": 37.78, "lng": -122.42, "timestamp": "2023-10-27T10:05:00Z" }],
});

export default function PlayerControls({
  currentUser,
  onColorChange,
  onPrediction,
  onClaimTerritory,
  canClaimTerritory
}: PlayerControlsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);

  const handlePrediction = async () => {
    if (showPrediction) {
      onPrediction(null);
      setShowPrediction(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await predictHighTrafficRoutes({
        territoryMapData: placeholderMapData,
        userMovementPatterns: placeholderMovementData,
      });

      if (result.predictedRoutesOverlay) {
        onPrediction(result.predictedRoutesOverlay);
        setShowPrediction(true);
        toast({
          title: 'Prediction Complete',
          description: 'High-traffic routes are now shown on the map.',
        });
      } else {
        throw new Error('No overlay data returned.');
      }
    } catch (error) {
      console.error('Prediction failed:', error);
      toast({
        variant: 'destructive',
        title: 'Prediction Failed',
        description: 'Could not generate high-traffic routes.',
      });
      onPrediction(null);
      setShowPrediction(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-sm max-w-xs">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <span>Player Controls</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Your Color</p>
          <div className="flex gap-2">
            {availableColors.map((color) => (
              <Button
                key={color}
                aria-label={`Select color ${color}`}
                onClick={() => onColorChange(color)}
                className={`h-8 w-8 rounded-full p-0 border-2 ${
                  currentUser.color === color
                    ? 'border-accent'
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        <Separator />
        <div>
           <Button 
            onClick={onClaimTerritory} 
            disabled={!canClaimTerritory} 
            className="w-full mb-2"
          >
            <Pin className="mr-2 h-4 w-4" />
            Claim Territory
           </Button>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Defense Tool</p>
          <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={handlePrediction} disabled={isLoading} className="w-full" variant={showPrediction ? "secondary" : "default"}>
                        {isLoading ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <BrainCircuit className="mr-2 h-4 w-4" />
                        )}
                        {showPrediction ? 'Hide Prediction' : 'Predict Hotspots'}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Predict high-traffic routes where territory may be contested.</p>
                </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
