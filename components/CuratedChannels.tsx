// components/CuratedChannels.tsx
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Channel {
  name: string
  description: string
  isSponsored: boolean
}

interface CuratedChannelsProps {
  channels: Channel[]
}

export function CuratedChannels({ channels }: CuratedChannelsProps) {
  if (!channels || channels.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mt-8">
      {channels.map((channel, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{channel.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{channel.description}</p>
          </CardContent>
          <CardFooter>
            <Link href={`/channel/${channel.name.startsWith('@') ? channel.name.slice(1) : channel.name.replace(/\s+/g, '-').toLowerCase()}`} passHref>
              <Button variant="outline" className="w-full">
                {channel.isSponsored ? "Chat Now" : "Sponsor Now"}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}