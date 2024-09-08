'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

const mockChannels = [
  { id: '1', name: '@drwaku', title: 'Dr Waku', subscribers: 1000000 },
  { id: '2', name: '@veritasium', title: 'Veritasium', subscribers: 12000000 },
  { id: '3', name: '@mkbhd', title: 'Marques Brownlee', subscribers: 15000000 },
  { id: '4', name: '@kurzgesagt', title: 'Kurzgesagt - In a Nutshell', subscribers: 18000000 },
  { id: '5', name: '@vsauce', title: 'Vsauce', subscribers: 17000000 },
  { id: '6', name: '@smartereveryday', title: 'Smarter Every Day', subscribers: 8000000 },
  { id: '7', name: '@tomscott', title: 'Tom Scott', subscribers: 5000000 },
  { id: '8', name: '@cgpgrey', title: 'CGP Grey', subscribers: 4000000 },
  { id: '9', name: '@minutephysics', title: 'MinutePhysics', subscribers: 3000000 },
  { id: '10', name: '@numberphile', title: 'Numberphile', subscribers: 2000000 },
  { id: '11', name: '@markrober', title: 'Mark Rober', subscribers: 16000000 },
  { id: '12', name: '@pewdiepie', title: 'PewDiePie', subscribers: 110000000 },
  { id: '13', name: '@jacksepticeye', title: 'Jacksepticeye', subscribers: 27000000 },
  { id: '14', name: '@daviddobrik', title: 'David Dobrik', subscribers: 18000000 },
  { id: '15', name: '@caseyneistat', title: 'Casey Neistat', subscribers: 12000000 },
  { id: '16', name: '@jennamarbles', title: 'Jenna Marbles', subscribers: 20000000 },
  { id: '17', name: '@lizakoshy', title: 'Liza Koshy', subscribers: 18000000 },
  { id: '18', name: '@mrbeast', title: 'MrBeast', subscribers: 60000000 },
  { id: '19', name: '@jamescharles', title: 'James Charles', subscribers: 25000000 },
  { id: '20', name: '@shanedawson', title: 'Shane Dawson', subscribers: 23000000 },
  { id: '21', name: '@jeffreestar', title: 'Jeffree Star', subscribers: 16000000 },
  { id: '22', name: '@emmachamberlain', title: 'Emma Chamberlain', subscribers: 10000000 },
  { id: '23', name: '@tseries', title: 'T-Series', subscribers: 180000000 },
  { id: '24', name: '@pewdiepie', title: 'PewDiePie', subscribers: 110000000 },
  { id: '25', name: '@justinbieber', title: 'Justin Bieber', subscribers: 60000000 },
  { id: '26', name: '@rihanna', title: 'Rihanna', subscribers: 40000000 },
  { id: '27', name: '@arianagrande', title: 'Ariana Grande', subscribers: 50000000 },
  { id: '28', name: '@billieeilish', title: 'Billie Eilish', subscribers: 30000000 },
  { id: '29', name: '@taylorswift', title: 'Taylor Swift', subscribers: 40000000 },
  { id: '30', name: '@katyperry', title: 'Katy Perry', subscribers: 40000000 },
  { id: '31', name: '@marshmello', title: 'Marshmello', subscribers: 45000000 },
  { id: '32', name: '@davidguetta', title: 'David Guetta', subscribers: 20000000 },
  { id: '33', name: '@calvinharris', title: 'Calvin Harris', subscribers: 20000000 },
  { id: '34', name: '@avicii', title: 'Avicii', subscribers: 10000000 },
  { id: '35', name: '@zedd', title: 'Zedd', subscribers: 10000000 },
  { id: '36', name: '@deadmau5', title: 'Deadmau5', subscribers: 5000000 },
  { id: '37', name: '@skrillex', title: 'Skrillex', subscribers: 10000000 },
  { id: '38', name: '@diplo', title: 'Diplo', subscribers: 5000000 },
  { id: '39', name: '@tiesto', title: 'Tiësto', subscribers: 5000000 },
  { id: '40', name: '@arminvanbuuren', title: 'Armin van Buuren', subscribers: 5000000 },
  { id: '41', name: '@hardwell', title: 'Hardwell', subscribers: 5000000 },
  { id: '42', name: '@martingarrix', title: 'Martin Garrix', subscribers: 20000000 },
  { id: '43', name: '@dimitrivegasandlikemike', title: 'Dimitri Vegas & Like Mike', subscribers: 5000000 },
  { id: '44', name: '@steveaoki', title: 'Steve Aoki', subscribers: 5000000 },
  { id: '45', name: '@nickyromero', title: 'Nicky Romero', subscribers: 5000000 },
  { id: '46', name: '@kaskade', title: 'Kaskade', subscribers: 5000000 },
  { id: '47', name: '@knifeparty', title: 'Knife Party', subscribers: 5000000 },
  { id: '48', name: '@aboveandbeyond', title: 'Above & Beyond', subscribers: 5000000 },
  { id: '49', name: '@bassnectar', title: 'Bassnectar', subscribers: 5000000 },
  { id: '50', name: '@dillonfrancis', title: 'Dillon Francis', subscribers: 5000000 },
  { id: '51', name: '@nikkietutorials', title: 'NikkieTutorials', subscribers: 14000000 },
  { id: '52', name: '@lillysingh', title: 'Lilly Singh', subscribers: 14000000 },
  { id: '53', name: '@smosh', title: 'Smosh', subscribers: 25000000 },
  { id: '54', name: '@romanatwood', title: 'Roman Atwood', subscribers: 15000000 },
  { id: '55', name: '@goodmythicalmorning', title: 'Good Mythical Morning', subscribers: 18000000 },
  { id: '56', name: '@linustechtips', title: 'Linus Tech Tips', subscribers: 16000000 },
  { id: '57', name: '@theellenshow', title: 'The Ellen Show', subscribers: 38000000 },
  { id: '58', name: '@markiplier', title: 'Markiplier', subscribers: 34000000 },
  { id: '59', name: '@ethoslab', title: 'EthosLab', subscribers: 2400000 },
  { id: '60', name: '@penguinz0', title: 'Penguinz0', subscribers: 14000000 },
  { id: '61', name: '@h3h3productions', title: 'h3h3Productions', subscribers: 6300000 },
  { id: '62', name: '@theodd1sout', title: 'TheOdd1sOut', subscribers: 18000000 },
  { id: '63', name: '@jaidenanimations', title: 'Jaiden Animations', subscribers: 12000000 },
  { id: '64', name: '@theslowmoguys', title: 'The Slow Mo Guys', subscribers: 14000000 },
  { id: '65', name: '@lindseystirling', title: 'Lindsey Stirling', subscribers: 13000000 },
  { id: '66', name: '@nigahiga', title: 'nigahiga', subscribers: 21000000 },
  { id: '67', name: '@jamescharles', title: 'James Charles', subscribers: 25000000 },
  { id: '68', name: '@charlidamelio', title: 'Charli D\'Amelio', subscribers: 10000000 },
  { id: '69', name: '@zachking', title: 'Zach King', subscribers: 10000000 },
  { id: '70', name: '@eminem', title: 'EminemMusic', subscribers: 54000000 },
  { id: '71', name: '@blazendary', title: 'Blazendary', subscribers: 1700000 },
  { id: '72', name: '@ricegum', title: 'RiceGum', subscribers: 10000000 },
  { id: '73', name: '@filthyfrank', title: 'Filthy Frank', subscribers: 7400000 },
  { id: '74', name: '@theofficialloganpaul', title: 'Logan Paul', subscribers: 23000000 },
  { id: '75', name: '@kyliejenner', title: 'Kylie Jenner', subscribers: 11000000 },
  { id: '76', name: '@jaclynhill', title: 'Jaclyn Hill', subscribers: 5500000 },
  { id: '77', name: '@youtubemusicians', title: 'YouTube Musicians', subscribers: 22000000 },
  { id: '78', name: '@lewishowes', title: 'Lewis Howes', subscribers: 1500000 },
  { id: '79', name: '@caseyneistat', title: 'Casey Neistat', subscribers: 12000000 },
  { id: '80', name: '@morganshawl', title: 'Morgan Shawl', subscribers: 5000000 },
  { id: '81', name: '@likeandsp', title: 'LIKE AND SP', subscribers: 4000000 },
  { id: '82', name: '@unboxtherapy', title: 'Unbox Therapy', subscribers: 20000000 },
  { id: '83', name: '@safiyanygaard', title: 'Safiya Nygaard', subscribers: 9000000 },
  { id: '84', name: '@tiffanyfong', title: 'Tiffany Fong', subscribers: 3000000 },
  { id: '85', name: '@dearhayley', title: 'Dear Hayley', subscribers: 1500000 },
  { id: '86', name: '@justamere', title: 'Just a Mere', subscribers: 6000000 },
  { id: '87', name: '@hotpeppers', title: 'Hot Peppers', subscribers: 8500000 },
  { id: '88', name: '@timschloss', title: 'Tim Schloss', subscribers: 5000000 },
  { id: '89', name: '@jacklyn', title: 'Jacklyn', subscribers: 3000000 },
  { id: '90', name: '@terryfowler', title: 'Terry Fowler', subscribers: 1000000 },
  { id: '91', name: '@thefinnster', title: 'The Finnster', subscribers: 2000000 },
  { id: '92', name: '@candyk', title: 'Candy K', subscribers: 1000000 },
  { id: '93', name: '@mimig', title: 'Mimi G', subscribers: 2500000 },
  { id: '94', name: '@techwithtim', title: 'Tech with Tim', subscribers: 3000000 },
  { id: '95', name: '@tania', title: 'Tania', subscribers: 7000000 },
  { id: '96', name: '@spencer', title: 'Spencer', subscribers: 8500000 },
  { id: '97', name: '@adison', title: 'Adison', subscribers: 4200000 },
  { id: '98', name: '@john', title: 'John', subscribers: 2000000 },
  { id: '99', name: '@rossmerritt', title: 'Ross Merritt', subscribers: 1500000 },
  { id: '100', name: '@therealmoney', title: 'The Real Money', subscribers: 7000000 }
]

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
  const [selectedIndex, setSelectedIndex] = useState<number>(-1) // Use -1 to represent no selection initially
  const router = useRouter()

  const searchChannels = useDebouncedCallback((term: string) => {
    setIsLoading(true)
    setTimeout(() => {
      const filteredResults = mockChannels
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
    setSelectedIndex(-1) // Reset selected index when search term changes
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
    if (results.length === 0) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex((prevIndex) =>
          prevIndex === -1 ? 0 : Math.min(prevIndex + 1, results.length - 1)
        )
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex((prevIndex) =>
          prevIndex === -1 ? results.length - 1 : Math.max(prevIndex - 1, 0)
        )
        break
      case 'Enter':
        if (selectedIndex >= 0) {
          handleSelectChannel(results[selectedIndex])
        }
        break
      case 'Escape':
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div className="relative w-full max-w-md" onKeyDown={handleKeyDown}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Search YouTube channels"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
          // Removed onKeyDown here to avoid duplication
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