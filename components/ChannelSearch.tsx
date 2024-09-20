// components/ChannelSearch.tsx
'use client'

import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

type ChannelSearchResult = {
  id: string;
  name: string;
  title: string;
  imageUrl?: string;
  subscriberCount?: string;
};

type ChannelSearchProps = {
  inputClassName?: string;
  buttonClassName?: string;
  containerClassName?: string;
  onSelect?: (channel: ChannelSearchResult) => void;
  onlyActive?: boolean; // New parameter to filter active channels
};

export default function ChannelSearch({
  inputClassName = '',
  buttonClassName = '',
  containerClassName = '',
  onSelect,
  onlyActive = false, // Default to false
}: ChannelSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ChannelSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const router = useRouter();

  const searchChannels = useDebouncedCallback(async (term: string) => {
    if (!term || term.length < 3) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      // Add the status parameter if filtering only active channels
      const statusParam = onlyActive ? '&status=ACTIVE' : '';
      const response = await fetch(`/api/channel/search?q=${encodeURIComponent(term)}${statusParam}`);
      const data = await response.json();
      if (response.ok) {
        setResults(data);
      } else {
        console.error('Error fetching channels:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (searchTerm) {
      searchChannels(searchTerm);
    } else {
      setResults([]);
    }
    setSelectedIndex(-1);
  }, [searchTerm, searchChannels]);

  const handleSelectChannel = useCallback((channel: ChannelSearchResult) => {
    if (onSelect) {
      onSelect(channel);
    } else {
      router.push(`/channel/@${channel.name}`);
    }
  }, [onSelect, router]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (results.length === 0 && event.key === 'Enter') {
      router.push(`/channel/@${searchTerm}`);
      return;
    }

    if (results.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex === -1 ? 0 : Math.min(prevIndex + 1, results.length - 1)
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex((prevIndex) =>
          prevIndex === -1 ? results.length - 1 : Math.max(prevIndex - 1, 0)
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectChannel(results[selectedIndex]);
        } else {
          router.push(`/channel/@${searchTerm}`);
        }
        break;
      case 'Escape':
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className={`relative w-full max-w-md mx-auto p-4 ${containerClassName}`}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Enter channel name (@channel)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pr-10 bg-gray-200 dark:bg-accent dark:text-white rounded-md ${inputClassName}`}
          onKeyDown={handleKeyDown}
        />
        <Button
          size="icon"
          variant="ghost"
          className={`absolute right-0 top-0 h-full ${buttonClassName}`}
          disabled={isLoading}
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-background border border-input rounded-md shadow-md text-center text-sm text-muted-foreground">
          Loading...
        </div>
      )}
      {results.length > 0 && !isLoading && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-md max-h-80 overflow-auto z-50">
          {results.map((channel, index) => (
            <li
              key={channel.name}
              className={`p-2 hover:bg-accent cursor-pointer ${
                selectedIndex === index ? 'bg-accent' : ''
              }`}
              onClick={() => handleSelectChannel(channel)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{channel.title}</div>
                  <div className="text-sm text-muted-foreground">@{channel.name}</div>
                </div>
                {channel.imageUrl && (
                  <img src={channel.imageUrl} alt={channel.title} className="w-8 h-8 rounded-full" />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}