// components/YouTubeChannelSearch.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

type Channel = {
  id: string
  name: string
  title: string
  description: string
  thumbnailUrl: string
}

export default function YouTubeChannelSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const router = useRouter()

  // Debounced function to call our API route
  const searchChannels = useDebouncedCallback(async (term: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(term)}`)
      const data = await response.json()
      if (response.ok) {
        setResults(data)
      } else {
        console.error('Error fetching YouTube channels:', data.error)
        setResults([])
      }
    } catch (error) {
      console.error('Error fetching YouTube channels:', error)
    } finally {
      setIsLoading(false)
    }
  }, 300)

  useEffect(() => {
    if (searchTerm) {
      searchChannels(searchTerm)
    } else {
      setResults([])
    }
    setSelectedIndex(-1)
  }, [searchTerm, searchChannels])

  const handleSelectChannel = useCallback(async (channel: Channel) => {
    try {
      // Fetch the channel info using the channelId
      const response = await fetch(`/api/yes/channel-info?channel_id=${channel.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch channel data: ${response.status} ${response.statusText}`);
      }
      const channelInfo = await response.json();
      // Navigate to /channel/@channelName
      router.push(`/channel/@${channelInfo.channel_name}`);
    } catch (error) {
      console.error('Error in handleSelectChannel:', error);
      // Optionally, display an error message to the user
    }
  }, [router]);

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
    <div className="relative w-full max-w-md mx-auto p-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search YouTube channels"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
          onKeyDown={handleKeyDown}
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-0 top-0 h-full"
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
              key={channel.id}
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}