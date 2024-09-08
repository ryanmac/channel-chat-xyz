'use client'

import { useState, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

type Channel = {
  id: string
  name: string
  title: string
  subscribers: number
}

export default function YouTubeChannelSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Function to call YouTube Data API
  const searchChannels = useDebouncedCallback(async (term: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(term)}&maxResults=25&key=YOUR_API_KEY`)
      const data = await response.json()

      // Extract channel information from API response
      const channels = data.items.map((item: any) => ({
        id: item.id.channelId,
        name: `@${item.snippet.channelTitle}`,
        title: item.snippet.title,
        subscribers: 0, // Subscribers will be fetched separately
      }))

      // Fetch subscribers count for each channel
      const channelIds = channels.map((channel: Channel) => channel.id).join(',')
      const statsResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds}&key=YOUR_API_KEY`)
      const statsData = await statsResponse.json()

      // Merge subscribers count with channel data
      const channelsWithSubscribers = channels.map((channel: Channel) => {
        const stats = statsData.items.find((item: any) => item.id === channel.id)
        return {
          ...channel,
          subscribers: stats ? parseInt(stats.statistics.subscriberCount, 10) : 0
        }
      })

      setResults(channelsWithSubscribers)
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
  }, [searchTerm, searchChannels])

  const formatSubscribers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search YouTube channels"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
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
      {isLoading && <div className="mt-2 text-center text-sm text-muted-foreground">Loading...</div>}
      {results.length > 0 && (
        <ul className="mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-auto">
          {results.map((channel: Channel) => (
            <li key={channel.id} className="p-2 hover:bg-gray-100 cursor-pointer">
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