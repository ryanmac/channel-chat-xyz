'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { defaultChannels, Channel } from '@/utils/defaultChannels'

interface YouTubeChannelSearchProps {
  inputWidth?: string
  inputHeight?: string
  className?: string
}

export default function YouTubeChannelSearch({
  inputWidth = "w-64",
  inputHeight = "h-10",
  className = ""
}: YouTubeChannelSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const router = useRouter()

  const searchChannels = useDebouncedCallback((term: string) => {
    setIsLoading(true)
    setTimeout(() => {
      const filteredResults = defaultChannels
        .filter(channel =>
          channel.name.toLowerCase().includes(term.toLowerCase()) ||
          channel.title.toLowerCase().includes(term.toLowerCase())
        )
        .sort((a, b) => b.subscribers - a.subscribers)
        .slice(0, 5)
      setResults(filteredResults)
      setIsLoading(false)
    }, 300)
  }, 300)

  useEffect(() => {
    if (searchTerm) {
      searchChannels(searchTerm)
    } else {
      setResults([])
    }
    setSelectedIndex(-1)
  }, [searchTerm, searchChannels])

  const formatSubscribers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const handleSelectChannel = useCallback((channel: Channel) => {
    router.push(`/channel/${channel.name}`)
  }, [router])

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
        if (selectedIndex >= 0) {
          handleSelectChannel(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className={`relative w-full ${className}`} onKeyDown={handleKeyDown}>
      <div className={`relative ${inputWidth} ${inputHeight} mx-auto`}>
        <Input
          type="text"
          placeholder="Search YouTube channels"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`pr-12 ${inputWidth} ${inputHeight}`} // Use dynamic width
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 top-0 h-full"
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
        <ul className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-md max-h-80 overflow-auto z-10">
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
                  <div className="font-semibold">{channel.name}</div>
                  <div className="text-sm text-muted-foreground">{channel.title}</div>
                </div>
                <div className="text-sm font-medium">{formatSubscribers(channel.subscribers)} subscribers</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}