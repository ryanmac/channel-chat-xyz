'use client'

import { useState, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { createCheckoutSession } from "@/utils/stripePayments";
import { Search, X } from "lucide-react"

// Mock data for demonstration purposes
const mockChannels = [
  { id: '1', name: '@drwaku', title: 'Dr Waku', subscribers: 1000000 },
  { id: '2', name: '@veritasium', title: 'Veritasium', subscribers: 12000000 },
  { id: '3', name: '@mkbhd', title: 'Marques Brownlee', subscribers: 15000000 },
  { id: '4', name: '@kurzgesagt', title: 'Kurzgesagt - In a Nutshell', subscribers: 18000000 },
  { id: '5', name: '@vsauce', title: 'Vsauce', subscribers: 17000000 },
]

type Channel = {
  id: string
  name: string
  title: string
  subscribers: number
}

export default function Component() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Channel[]>([])
  const [selectedChannels, setSelectedChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [amountPerChannel, setAmountPerChannel] = useState(1)

  const searchChannels = useDebouncedCallback((term: string) => {
    setIsLoading(true)
    // Simulating API call with mock data
    setTimeout(() => {
      const filteredResults = mockChannels
        .filter(channel => 
          channel.name.toLowerCase().includes(term.toLowerCase()) ||
          channel.title.toLowerCase().includes(term.toLowerCase())
        )
        .sort((a, b) => b.subscribers - a.subscribers)
      setSearchResults(filteredResults)
      setIsLoading(false)
    }, 300)
  }, 300)

  useEffect(() => {
    if (searchTerm) {
      searchChannels(searchTerm)
    } else {
      setSearchResults([])
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

  const addChannel = (channel: Channel) => {
    if (!selectedChannels.some(c => c.id === channel.id)) {
      setSelectedChannels([...selectedChannels, channel])
      setSearchTerm('')
      setSearchResults([])
    }
  }

  const removeChannel = (channelId: string) => {
    setSelectedChannels(selectedChannels.filter(c => c.id !== channelId))
  }

  const totalAmount = selectedChannels.length * amountPerChannel

  const handleSponsor = async () => {
    if (selectedChannels.length > 0) {
      const channelNames = selectedChannels.map((channel) => channel.name).join(', ');
      await createCheckoutSession(channelNames, `Boost ${amountPerChannel}`, totalAmount);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="relative mb-4">
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
      {searchResults.length > 0 && (
        <ul className="mt-2 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {searchResults.map((channel) => (
            <li 
              key={channel.id} 
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => addChannel(channel)}
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
      {selectedChannels.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Selected Channels</h2>
          <ul className="space-y-2">
            {selectedChannels.map((channel) => (
              <li key={channel.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>{channel.name}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeChannel(channel.id)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount per channel: ${amountPerChannel}
        </label>
        <Slider
          value={[amountPerChannel]}
          onValueChange={(value) => setAmountPerChannel(value[0])}
          max={100}
          step={1}
        />
      </div>
      <div className="mt-4">
        <p className="text-lg font-semibold">
          Total: ${totalAmount} ({selectedChannels.length} channels)
        </p>
      </div>
      <Button
        className="w-full mt-4"
        onClick={handleSponsor}
        disabled={selectedChannels.length === 0}
      >
        Sponsor
      </Button>
    </div>
  )
}