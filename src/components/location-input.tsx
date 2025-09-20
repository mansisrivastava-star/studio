'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { cn } from '@/lib/utils';

interface LocationInputProps {
  onLocationSet: (city: string, country: string) => void;
}

interface Suggestion {
  id: string;
  place_name: string;
  context: { id: string; text: string }[];
}

const formSchema = z.object({
  city: z.string().min(1, { message: 'City is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
});

export default function LocationInput({ onLocationSet }: LocationInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    // Open the dialog automatically on component mount
    setIsOpen(true);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: '',
      country: '',
    },
  });

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (cityQuery.length > 2 && accessToken) {
        setIsLoading(true);
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              cityQuery
            )}.json?access_token=${accessToken}&types=place`
          );
          const data = await response.json();
          setSuggestions(data.features || []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to fetch city suggestions:', error);
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
  }, [cityQuery, accessToken]);

  // Click outside handler
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


  function onSubmit(values: z.infer<typeof formSchema>) {
    onLocationSet(values.city, values.country);
    setIsOpen(false);
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const city = suggestion.place_name.split(',')[0];
    const countryObj = suggestion.context.find(c => c.id.startsWith('country'));
    const country = countryObj ? countryObj.text : '';

    form.setValue('city', city);
    form.setValue('country', country);
    setCityQuery(city);
    setShowSuggestions(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Set Your Location
              </DialogTitle>
              <DialogDescription>
                Enter your city and country to start playing.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="e.g. San Francisco"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setCityQuery(e.target.value);
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
                <div ref={suggestionsRef} className="absolute z-10 w-full top-[165px] left-0 px-6">
                    <div className="max-h-48 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md">
                    {suggestions.map((suggestion) => (
                        <div
                        key={suggestion.id}
                        className="cursor-pointer p-3 hover:bg-accent text-sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        >
                        {suggestion.place_name}
                        </div>
                    ))}
                    </div>
                </div>
                )}
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Start Playing</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
