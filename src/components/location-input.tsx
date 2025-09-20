
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

interface LocationInputProps {
  onLocationSet: (name: string, coords: LatLngLiteral) => void;
  isOpen: boolean;
}

const formSchema = z.object({
  search: z.string().min(1, { message: 'Location is required' }),
});

interface MapboxSuggestion {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  context: { id: string; text: string }[];
}

export default function LocationInput({ onLocationSet, isOpen }: LocationInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
    },
  });

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsLoading(true);
        const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!accessToken) {
          console.error("Mapbox token not found");
          setIsLoading(false);
          return;
        }
        
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${accessToken}&autocomplete=true`;
        
        try {
          const response = await fetch(endpoint);
          const data = await response.json();
          setSuggestions(data.features || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching Mapbox suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
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

  const handleSuggestionClick = (suggestion: MapboxSuggestion) => {
    setShowSuggestions(false);
    form.setValue('search', suggestion.place_name);
    
    const coords: LatLngLiteral = {
      lat: suggestion.center[1],
      lng: suggestion.center[0],
    };
    onLocationSet(suggestion.place_name, coords);
  };
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Set Your Starting Location
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
                        />
                         {isLoading && (
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
                    {suggestions.map((suggestion) => {
                        const mainText = suggestion.place_name.split(',')[0];
                        const secondaryText = suggestion.place_name.substring(mainText.length + 1).trim();
                        return (
                            <div
                                key={suggestion.id}
                                className="cursor-pointer p-3 hover:bg-accent"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <p className="font-semibold text-sm">{mainText}</p>
                                <p className="text-xs text-muted-foreground">{secondaryText}</p>
                            </div>
                        )
                    })}
                    </div>
                </div>
                )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
