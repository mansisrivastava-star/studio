
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { LatLngLiteral } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  onLocationSet: (city: string, country: string, coords: LatLngLiteral) => void;
}

interface Suggestion {
  id: string;
  place_name: string;
  text: string;
  context: { id: string; text: string }[];
  center: [number, number]; // [lng, lat]
}

const formSchema = z.object({
  search: z.string().min(1, { message: 'Location is required' }),
});

export default function LocationInput({ onLocationSet }: LocationInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<Suggestion | null>(null);

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
    },
  });

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchQuery.length > 2 && accessToken) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              searchQuery
            )}.json?access_token=${accessToken}&types=place,neighborhood,address,poi`
          );
          const data = await response.json();
          setSuggestions(data.features || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to fetch location suggestions:', error);
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
  }, [searchQuery, accessToken]);

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

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const placeName = suggestion.place_name;
    const coords: LatLngLiteral = {
      lng: suggestion.center[0],
      lat: suggestion.center[1],
    };

    form.setValue('search', placeName);
    setSelectedLocation(suggestion);
    
    setSearchQuery(placeName);
    setShowSuggestions(false);
    
    // Also trigger the location set to update the map immediately
    const cityObj = suggestion.context.find(c => c.id.startsWith('place'));
    const countryObj = suggestion.context.find(c => c.id.startsWith('country'));
    const city = cityObj ? cityObj.text : suggestion.text;
    const country = countryObj ? countryObj.text : '';

    onLocationSet(city, country, coords);
  };
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (selectedLocation) {
        setIsOpen(false);
    } else {
      console.warn("Form submitted without selecting a location from suggestions.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            setSelectedLocation(null);
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
                <div ref={suggestionsRef} className="absolute z-10 w-full mt-1">
                    <div className="max-h-60 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                    {suggestions.map((suggestion) => (
                        <div
                        key={suggestion.id}
                        className="cursor-pointer p-3 hover:bg-accent text-sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        >
                        <p className="font-semibold">{suggestion.text}</p>
                        <p className="text-xs text-muted-foreground">{suggestion.place_name.substring(suggestion.text.length).replace(/^, /, '')}</p>
                        </div>
                    ))}
                    </div>
                </div>
                )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={!selectedLocation}>Start Playing</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
