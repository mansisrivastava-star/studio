
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { LatLngLiteral } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MapPin, Loader } from 'lucide-react';
import { useLoadScript } from '@react-google-maps/api';

interface LocationInputProps {
  onLocationSet: (name: string, coords: LatLngLiteral) => void;
  isOpen: boolean;
}

const formSchema = z.object({
  search: z.string().min(1, { message: 'Location is required' }),
});

const libraries: ('places')[] = ['places'];

export default function LocationInput({ onLocationSet, isOpen }: LocationInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    if (isLoaded) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      // We need a dummy div to initialize the PlacesService
      const dummyMapDiv = document.createElement('div');
      placesService.current = new google.maps.places.PlacesService(dummyMapDiv);
    }
  }, [isLoaded]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
    },
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.length > 2 && autocompleteService.current) {
        setIsLoading(true);
        autocompleteService.current.getPlacePredictions(
          { input: searchQuery },
          (predictions, status) => {
            setIsLoading(false);
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions);
              setShowSuggestions(true);
            } else {
              setSuggestions([]);
            }
          }
        );
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // Debounce for 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [suggestionsRef]);

  const handleSuggestionClick = (suggestion: google.maps.places.AutocompletePrediction) => {
    if (!placesService.current) return;

    setShowSuggestions(false);
    form.setValue('search', suggestion.description);

    const request = {
      placeId: suggestion.place_id,
      fields: ['name', 'geometry.location'],
    };

    placesService.current.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
        const coords: LatLngLiteral = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        onLocationSet(suggestion.description, coords);
      }
    });
  };
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Set Your Location
              </DialogTitle>
              <DialogDescription>
                Enter a city, neighborhood, or address to start playing.
              </DialogDescription>
            </DialogHeader>
            <div className="relative pt-2">
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="e.g., Golden Gate Park, San Francisco"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setSearchQuery(e.target.value);
                          }}
                          autoComplete="off"
                          disabled={!isLoaded}
                        />
                         {(isLoading || !isLoaded) && (
                          <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md">
                    <div className="max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                        <div
                        key={suggestion.place_id}
                        className="cursor-pointer p-3 hover:bg-accent"
                        onClick={() => handleSuggestionClick(suggestion)}
                        >
                        <p className="font-semibold text-sm">{suggestion.structured_formatting.main_text}</p>
                        <p className="text-xs text-muted-foreground">{suggestion.structured_formatting.secondary_text}</p>
                        </div>
                    ))}
                    </div>
                </div>
                )}
            </div>
            {loadError && <p className="text-xs text-destructive">Could not load Google Maps search.</p>}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
